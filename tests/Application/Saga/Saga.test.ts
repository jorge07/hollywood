import "reflect-metadata";

import Saga from "../../../src/Application/Saga/Saga";
import SagaManager from "../../../src/Application/Saga/SagaManager";
import InMemorySagaRepository from "../../../src/Application/Saga/InMemorySagaRepository";
import { SagaStatus } from "../../../src/Application/Saga/SagaState";
import CommandBus from "../../../src/Application/Bus/Command/CommandBus";
import CommandHandlerResolver from "../../../src/Application/Bus/Command/CommandHandlerResolver";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import DomainEvent from "../../../src/Domain/Event/DomainEvent";
import type ICommand from "../../../src/Application/Bus/Command/Command";
import type IMiddleware from "../../../src/Application/Bus/Middelware";
import type ICommandHandler from "../../../src/Application/Bus/Command/CommandHandler";
import autowiring from "../../../src/Application/Bus/autowiring";

// Test Events
class OrderPlaced extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        public readonly amount: number,
    ) {
        super();
    }
}

class PaymentReceived extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly paymentId: string,
    ) {
        super();
    }
}

class ShipmentCreated extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly shipmentId: string,
    ) {
        super();
    }
}

class PaymentFailed extends DomainEvent {
    constructor(
        public readonly orderId: string,
        public readonly reason: string,
    ) {
        super();
    }
}

// Test Commands
class ReserveInventory implements ICommand {
    constructor(public readonly orderId: string) {}
}

class ProcessPayment implements ICommand {
    constructor(
        public readonly orderId: string,
        public readonly amount: number,
    ) {}
}

class CreateShipment implements ICommand {
    constructor(public readonly orderId: string) {}
}

class CancelOrder implements ICommand {
    constructor(public readonly orderId: string) {}
}

class RefundPayment implements ICommand {
    constructor(public readonly paymentId: string) {}
}

// Test Saga State
interface OrderFulfillmentState {
    orderId?: string;
    customerId?: string;
    amount?: number;
    paymentId?: string;
    shipmentId?: string;
    inventoryReserved: boolean;
    paymentProcessed: boolean;
    shipmentCreated: boolean;
}

// Test Saga
class OrderFulfillmentSaga extends Saga<OrderFulfillmentState> {
    readonly sagaType = 'OrderFulfillmentSaga';

    static startedBy(): string[] {
        return ['OrderPlaced'];
    }

    protected getEventHandlers(): Map<string, (event: any) => Promise<void>> {
        const handlers = new Map<string, (event: any) => Promise<void>>();
        handlers.set('OrderPlaced', this.onOrderPlaced.bind(this));
        handlers.set('PaymentReceived', this.onPaymentReceived.bind(this));
        handlers.set('ShipmentCreated', this.onShipmentCreated.bind(this));
        handlers.set('PaymentFailed', this.onPaymentFailed.bind(this));
        return handlers;
    }

    protected getCompensationHandlers(): Map<string, () => Promise<void>> {
        const handlers = new Map<string, () => Promise<void>>();
        handlers.set('PaymentReceived', this.compensatePayment.bind(this));
        handlers.set('OrderPlaced', this.compensateOrder.bind(this));
        return handlers;
    }

    private async onOrderPlaced(event: OrderPlaced): Promise<void> {
        this.state.orderId = event.orderId;
        this.state.customerId = event.customerId;
        this.state.amount = event.amount;

        // Reserve inventory
        await this.dispatch(new ReserveInventory(event.orderId));
        this.state.inventoryReserved = true;

        // Process payment
        await this.dispatch(new ProcessPayment(event.orderId, event.amount));
    }

    private async onPaymentReceived(event: PaymentReceived): Promise<void> {
        this.state.paymentId = event.paymentId;
        this.state.paymentProcessed = true;

        // Create shipment
        await this.dispatch(new CreateShipment(event.orderId));
    }

    private async onShipmentCreated(event: ShipmentCreated): Promise<void> {
        this.state.shipmentId = event.shipmentId;
        this.state.shipmentCreated = true;

        // Saga is complete
        this.complete();
    }

    private async onPaymentFailed(event: PaymentFailed): Promise<void> {
        await this.fail(`Payment failed: ${event.reason}`);
    }

    private async compensatePayment(): Promise<void> {
        if (this.state.paymentId) {
            await this.dispatch(new RefundPayment(this.state.paymentId));
        }
    }

    private async compensateOrder(): Promise<void> {
        if (this.state.orderId) {
            await this.dispatch(new CancelOrder(this.state.orderId));
        }
    }
}

// Command Handler Middleware for testing - captures all executed commands
class TestCommandMiddleware implements IMiddleware {
    public executedCommands: ICommand[] = [];

    async execute(command: ICommand, next: (command: ICommand) => Promise<void>): Promise<void> {
        this.executedCommands.push(command);
        return await next(command);
    }
}

// Generic no-op handler for any command
class NoOpCommandHandler implements ICommandHandler {
    @autowiring
    async handle(_command: ICommand): Promise<void> {
        // No-op - just accepts the command
    }
}

describe("Saga", () => {
    describe("Saga lifecycle", () => {
        it("should start in PENDING status", () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            expect(saga.getStatus()).toBe(SagaStatus.PENDING);
            expect(saga.isActive()).toBe(true);
        });

        it("should transition to RUNNING when handling first event", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            // Set up command dispatcher
            saga.setCommandDispatcher(async () => {});

            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await saga.handle(message);

            expect(saga.getStatus()).toBe(SagaStatus.RUNNING);
        });

        it("should transition to COMPLETED when complete() is called", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    orderId: 'order-123',
                    customerId: 'customer-1',
                    amount: 100,
                    paymentId: 'payment-1',
                    inventoryReserved: true,
                    paymentProcessed: true,
                    shipmentCreated: false,
                },
                'order-123'
            );

            saga.setCommandDispatcher(async () => {});

            // Simulate that the saga has already processed earlier events
            const orderPlacedMessage = DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100));
            await saga.handle(orderPlacedMessage);

            const paymentMessage = DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1'));
            await saga.handle(paymentMessage);

            const shipmentMessage = DomainMessage.create('order-123', 2, new ShipmentCreated('order-123', 'shipment-1'));
            await saga.handle(shipmentMessage);

            expect(saga.getStatus()).toBe(SagaStatus.COMPLETED);
            expect(saga.isActive()).toBe(false);
        });

        it("should not process events after completion", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    orderId: 'order-123',
                    inventoryReserved: true,
                    paymentProcessed: true,
                    shipmentCreated: false,
                },
                'order-123'
            );

            saga.setCommandDispatcher(async () => {});

            // Complete the saga
            const shipmentMessage = DomainMessage.create('order-123', 0, new ShipmentCreated('order-123', 'shipment-1'));
            await saga.handle(shipmentMessage);

            expect(saga.getStatus()).toBe(SagaStatus.COMPLETED);

            // Try to handle another event
            const anotherMessage = DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-2'));

            // Should not throw, just not process
            await saga.handle(anotherMessage);

            // The saga should still be completed
            expect(saga.getStatus()).toBe(SagaStatus.COMPLETED);
        });
    });

    describe("Saga compensation", () => {
        it("should transition to FAILED after compensation on failure", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    orderId: 'order-123',
                    paymentId: 'payment-1',
                    inventoryReserved: true,
                    paymentProcessed: true,
                    shipmentCreated: false,
                },
                'order-123'
            );

            const compensationCommands: ICommand[] = [];
            saga.setCommandDispatcher(async (cmd) => { compensationCommands.push(cmd); });

            // Simulate earlier events being processed
            const orderPlacedMessage = DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100));
            await saga.handle(orderPlacedMessage);

            const paymentMessage = DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1'));
            await saga.handle(paymentMessage);

            // Now trigger failure
            const failureMessage = DomainMessage.create('order-123', 2, new PaymentFailed('order-123', 'Insufficient funds'));
            await saga.handle(failureMessage);

            expect(saga.getStatus()).toBe(SagaStatus.FAILED);
            expect(saga.isActive()).toBe(false);
        });

        it("should run compensation handlers in reverse order", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    orderId: 'order-123',
                    paymentId: 'payment-1',
                    inventoryReserved: true,
                    paymentProcessed: true,
                    shipmentCreated: false,
                },
                'order-123'
            );

            const compensationCommands: string[] = [];
            saga.setCommandDispatcher(async (cmd) => {
                compensationCommands.push(cmd.constructor.name);
            });

            // Simulate earlier events being processed
            const orderPlacedMessage = DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100));
            await saga.handle(orderPlacedMessage);

            const paymentMessage = DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1'));
            await saga.handle(paymentMessage);

            // Clear commands from setup
            compensationCommands.length = 0;

            // Trigger failure
            const failureMessage = DomainMessage.create('order-123', 2, new PaymentFailed('order-123', 'Insufficient funds'));
            await saga.handle(failureMessage);

            // Compensation should run in reverse: PaymentReceived first, then OrderPlaced
            expect(compensationCommands).toContain('RefundPayment');
            expect(compensationCommands).toContain('CancelOrder');
            expect(compensationCommands.indexOf('RefundPayment')).toBeLessThan(compensationCommands.indexOf('CancelOrder'));
        });
    });

    describe("Saga event handling", () => {
        it("should dispatch commands when handling events", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            const dispatchedCommands: ICommand[] = [];
            saga.setCommandDispatcher(async (cmd) => { dispatchedCommands.push(cmd); });

            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await saga.handle(message);

            expect(dispatchedCommands.length).toBe(2);
            expect(dispatchedCommands[0]).toBeInstanceOf(ReserveInventory);
            expect(dispatchedCommands[1]).toBeInstanceOf(ProcessPayment);
        });

        it("should be idempotent - not process same event twice", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            let commandCount = 0;
            saga.setCommandDispatcher(async () => { commandCount++; });

            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await saga.handle(message);
            await saga.handle(message); // Same event again

            expect(commandCount).toBe(2); // Should only dispatch once
        });

        it("should throw error when dispatching without command dispatcher", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await expect(saga.handle(message)).rejects.toThrow('Command dispatcher not set');
        });
    });

    describe("Saga persistence", () => {
        it("should create snapshot with correct state", async () => {
            const saga = new OrderFulfillmentSaga(
                'saga-1',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'order-123'
            );

            saga.setCommandDispatcher(async () => {});

            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);
            await saga.handle(message);

            const snapshot = saga.toSnapshot();

            expect(snapshot.sagaId).toBe('saga-1');
            expect(snapshot.sagaType).toBe('OrderFulfillmentSaga');
            expect(snapshot.correlationId).toBe('order-123');
            expect(snapshot.status).toBe(SagaStatus.RUNNING);
            expect(snapshot.state.orderId).toBe('order-123');
            expect(snapshot.state.inventoryReserved).toBe(true);
            expect(snapshot.processedEvents.length).toBe(1);
        });

        it("should restore from snapshot", () => {
            const saga = new OrderFulfillmentSaga(
                'temp',
                {
                    inventoryReserved: false,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                'temp'
            );

            const snapshot = {
                sagaId: 'saga-1',
                sagaType: 'OrderFulfillmentSaga',
                status: SagaStatus.RUNNING,
                state: {
                    orderId: 'order-123',
                    inventoryReserved: true,
                    paymentProcessed: false,
                    shipmentCreated: false,
                },
                correlationId: 'order-123',
                startedAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-02'),
                processedEvents: ['OrderPlaced:order-123:0'],
            };

            saga.fromSnapshot(snapshot);

            expect(saga.sagaId).toBe('saga-1');
            expect(saga.getStatus()).toBe(SagaStatus.RUNNING);

            const newSnapshot = saga.toSnapshot();
            expect(newSnapshot.state.orderId).toBe('order-123');
            expect(newSnapshot.state.inventoryReserved).toBe(true);
        });
    });
});

describe("SagaManager", () => {
    let commandBus: CommandBus;
    let repository: InMemorySagaRepository;
    let sagaManager: SagaManager;
    let middleware: TestCommandMiddleware;
    let resolver: CommandHandlerResolver;

    beforeEach(() => {
        middleware = new TestCommandMiddleware();
        resolver = new CommandHandlerResolver();
        commandBus = new CommandBus(middleware, resolver);
        repository = new InMemorySagaRepository();
        sagaManager = new SagaManager(commandBus, repository);

        // Register handlers for all test commands
        const noOpHandler = new NoOpCommandHandler();
        resolver.addHandler(ReserveInventory, noOpHandler);
        resolver.addHandler(ProcessPayment, noOpHandler);
        resolver.addHandler(CreateShipment, noOpHandler);
        resolver.addHandler(CancelOrder, noOpHandler);
        resolver.addHandler(RefundPayment, noOpHandler);
    });

    describe("Saga registration", () => {
        it("should register saga types", () => {
            sagaManager.register(
                'OrderFulfillmentSaga',
                (id, correlationId) => new OrderFulfillmentSaga(
                    id,
                    { inventoryReserved: false, paymentProcessed: false, shipmentCreated: false },
                    correlationId
                ),
                ['OrderPlaced'],
                (event) => event.orderId
            );

            // No error thrown means successful registration
            expect(true).toBe(true);
        });
    });

    describe("Starting sagas", () => {
        beforeEach(() => {
            sagaManager.register(
                'OrderFulfillmentSaga',
                (id, correlationId) => new OrderFulfillmentSaga(
                    id,
                    { inventoryReserved: false, paymentProcessed: false, shipmentCreated: false },
                    correlationId
                ),
                ['OrderPlaced'],
                (event) => event.orderId
            );
        });

        it("should start a new saga when starting event occurs", async () => {
            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await sagaManager.on(message);

            const sagas = await repository.findByCorrelationId('order-123');
            expect(sagas.length).toBe(1);
            expect(sagas[0].status).toBe(SagaStatus.RUNNING);
        });

        it("should not start duplicate saga for same correlation ID", async () => {
            const event = new OrderPlaced('order-123', 'customer-1', 100);
            const message = DomainMessage.create('order-123', 0, event);

            await sagaManager.on(message);
            await sagaManager.on(message);

            const sagas = await repository.findByCorrelationId('order-123');
            expect(sagas.length).toBe(1);
        });

        it("should start separate sagas for different correlation IDs", async () => {
            const event1 = new OrderPlaced('order-123', 'customer-1', 100);
            const message1 = DomainMessage.create('order-123', 0, event1);

            const event2 = new OrderPlaced('order-456', 'customer-2', 200);
            const message2 = DomainMessage.create('order-456', 0, event2);

            await sagaManager.on(message1);
            await sagaManager.on(message2);

            const sagas1 = await repository.findByCorrelationId('order-123');
            const sagas2 = await repository.findByCorrelationId('order-456');

            expect(sagas1.length).toBe(1);
            expect(sagas2.length).toBe(1);
        });
    });

    describe("Event routing", () => {
        beforeEach(() => {
            sagaManager.register(
                'OrderFulfillmentSaga',
                (id, correlationId) => new OrderFulfillmentSaga(
                    id,
                    { inventoryReserved: false, paymentProcessed: false, shipmentCreated: false },
                    correlationId
                ),
                ['OrderPlaced'],
                (event) => event.orderId
            );
        });

        it("should route subsequent events to active saga", async () => {
            // Start saga
            const orderPlaced = new OrderPlaced('order-123', 'customer-1', 100);
            const orderMessage = DomainMessage.create('order-123', 0, orderPlaced);
            await sagaManager.on(orderMessage);

            // Route payment event
            const paymentReceived = new PaymentReceived('order-123', 'payment-1');
            const paymentMessage = DomainMessage.create('order-123', 1, paymentReceived);
            await sagaManager.on(paymentMessage);

            const sagas = await repository.findByCorrelationId('order-123');
            const state = sagas[0].state as OrderFulfillmentState;
            expect(state.paymentId).toBe('payment-1');
            expect(state.paymentProcessed).toBe(true);
        });

        it("should complete saga when all steps are done", async () => {
            // Start saga
            const orderPlaced = new OrderPlaced('order-123', 'customer-1', 100);
            await sagaManager.on(DomainMessage.create('order-123', 0, orderPlaced));

            // Payment received
            const paymentReceived = new PaymentReceived('order-123', 'payment-1');
            await sagaManager.on(DomainMessage.create('order-123', 1, paymentReceived));

            // Shipment created
            const shipmentCreated = new ShipmentCreated('order-123', 'shipment-1');
            await sagaManager.on(DomainMessage.create('order-123', 2, shipmentCreated));

            const sagas = await repository.findByCorrelationId('order-123');
            expect(sagas[0].status).toBe(SagaStatus.COMPLETED);
        });

        it("should not route events to completed saga", async () => {
            // Complete a saga
            await sagaManager.on(DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100)));
            await sagaManager.on(DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1')));
            await sagaManager.on(DomainMessage.create('order-123', 2, new ShipmentCreated('order-123', 'shipment-1')));

            const beforeCount = middleware.executedCommands.length;

            // Try to send another event
            await sagaManager.on(DomainMessage.create('order-123', 3, new PaymentReceived('order-123', 'payment-2')));

            const afterCount = middleware.executedCommands.length;

            // No new commands should have been dispatched
            expect(afterCount).toBe(beforeCount);
        });
    });

    describe("Saga failure and compensation", () => {
        beforeEach(() => {
            sagaManager.register(
                'OrderFulfillmentSaga',
                (id, correlationId) => new OrderFulfillmentSaga(
                    id,
                    { inventoryReserved: false, paymentProcessed: false, shipmentCreated: false },
                    correlationId
                ),
                ['OrderPlaced'],
                (event) => event.orderId
            );
        });

        it("should handle saga failure and run compensation", async () => {
            // Start saga
            await sagaManager.on(DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100)));

            // Payment received (so we have something to compensate)
            await sagaManager.on(DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1')));

            const commandsBeforeFailure = middleware.executedCommands.length;

            // Payment fails - triggers compensation
            await sagaManager.on(DomainMessage.create('order-123', 2, new PaymentFailed('order-123', 'Card declined')));

            const sagas = await repository.findByCorrelationId('order-123');
            expect(sagas[0].status).toBe(SagaStatus.FAILED);
            expect(sagas[0].failureReason).toContain('Card declined');

            // Should have dispatched compensation commands
            expect(middleware.executedCommands.length).toBeGreaterThan(commandsBeforeFailure);
        });
    });

    describe("Saga status queries", () => {
        beforeEach(() => {
            sagaManager.register(
                'OrderFulfillmentSaga',
                (id, correlationId) => new OrderFulfillmentSaga(
                    id,
                    { inventoryReserved: false, paymentProcessed: false, shipmentCreated: false },
                    correlationId
                ),
                ['OrderPlaced'],
                (event) => event.orderId
            );
        });

        it("should return saga status by ID", async () => {
            await sagaManager.on(DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100)));

            const sagas = await repository.findByCorrelationId('order-123');
            const status = await sagaManager.getSagaStatus(sagas[0].sagaId);

            expect(status).toBeDefined();
            expect(status?.status).toBe(SagaStatus.RUNNING);
        });

        it("should return active sagas for correlation ID", async () => {
            await sagaManager.on(DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100)));

            const activeSagas = await sagaManager.getActiveSagasForCorrelation('order-123');

            expect(activeSagas.length).toBe(1);
            expect(activeSagas[0].status).toBe(SagaStatus.RUNNING);
        });

        it("should not return completed sagas as active", async () => {
            // Complete a saga
            await sagaManager.on(DomainMessage.create('order-123', 0, new OrderPlaced('order-123', 'customer-1', 100)));
            await sagaManager.on(DomainMessage.create('order-123', 1, new PaymentReceived('order-123', 'payment-1')));
            await sagaManager.on(DomainMessage.create('order-123', 2, new ShipmentCreated('order-123', 'shipment-1')));

            const activeSagas = await sagaManager.getActiveSagasForCorrelation('order-123');

            expect(activeSagas.length).toBe(0);
        });
    });
});

describe("InMemorySagaRepository", () => {
    let repository: InMemorySagaRepository;

    beforeEach(() => {
        repository = new InMemorySagaRepository();
    });

    it("should save and load saga", async () => {
        const snapshot = {
            sagaId: 'saga-1',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: { foo: 'bar' },
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        };

        await repository.save(snapshot);
        const loaded = await repository.load('saga-1');

        expect(loaded).toBeDefined();
        expect(loaded?.sagaId).toBe('saga-1');
        expect(loaded?.state).toEqual({ foo: 'bar' });
    });

    it("should find by correlation ID", async () => {
        const snapshot1 = {
            sagaId: 'saga-1',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: {},
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        };

        const snapshot2 = {
            sagaId: 'saga-2',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: {},
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        };

        await repository.save(snapshot1);
        await repository.save(snapshot2);

        const found = await repository.findByCorrelationId('corr-1');

        expect(found.length).toBe(2);
    });

    it("should delete saga", async () => {
        const snapshot = {
            sagaId: 'saga-1',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: {},
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        };

        await repository.save(snapshot);
        await repository.delete('saga-1');

        const loaded = await repository.load('saga-1');
        expect(loaded).toBeUndefined();

        const byCorrelation = await repository.findByCorrelationId('corr-1');
        expect(byCorrelation.length).toBe(0);
    });

    it("should return undefined for non-existent saga", async () => {
        const loaded = await repository.load('non-existent');
        expect(loaded).toBeUndefined();
    });

    it("should return deep clones to prevent mutation", async () => {
        const snapshot = {
            sagaId: 'saga-1',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: { foo: 'bar' },
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        };

        await repository.save(snapshot);

        const loaded1 = await repository.load('saga-1');
        (loaded1 as any).state.foo = 'modified';

        const loaded2 = await repository.load('saga-1');
        expect(loaded2?.state).toEqual({ foo: 'bar' });
    });

    it("should clear all sagas", async () => {
        await repository.save({
            sagaId: 'saga-1',
            sagaType: 'TestSaga',
            status: SagaStatus.RUNNING,
            state: {},
            correlationId: 'corr-1',
            startedAt: new Date(),
            updatedAt: new Date(),
            processedEvents: [],
        });

        expect(repository.count()).toBe(1);

        repository.clear();

        expect(repository.count()).toBe(0);
    });
});
