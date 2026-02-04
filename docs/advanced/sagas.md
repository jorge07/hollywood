# Sagas & Process Managers

Sagas coordinate long-running workflows across multiple aggregates. They listen to domain events and dispatch commands to progress the workflow.

## When to Use Sagas

Use sagas when you need to:
- Coordinate actions across multiple aggregates
- Implement multi-step workflows
- Handle compensation (rollback) when steps fail
- Track the progress of a business process

## Creating a Saga

A saga extends `Saga<TState>` and defines:
1. Events that start the saga
2. Event handlers that progress the workflow
3. Optional compensation handlers for rollback

```typescript
import { Application } from "hollywood-js";
import type DomainMessage from "hollywood-js/Domain/Event/DomainMessage";

// Define the saga's internal state
interface OrderFulfillmentState {
    orderId?: string;
    paymentId?: string;
    amount?: number;
}

class OrderFulfillmentSaga extends Application.Saga<OrderFulfillmentState> {
    readonly sagaType = "OrderFulfillmentSaga";

    // Events that can start this saga
    static startedBy(): string[] {
        return ["OrderPlaced"];
    }

    // Map event types to handler methods
    protected getEventHandlers(): Map<string, (event: any) => Promise<void>> {
        return new Map([
            ["OrderPlaced", this.onOrderPlaced.bind(this)],
            ["PaymentReceived", this.onPaymentReceived.bind(this)],
            ["ShipmentCreated", this.onShipmentCreated.bind(this)],
        ]);
    }

    // Compensation handlers for rollback
    protected getCompensationHandlers(): Map<string, () => Promise<void>> {
        return new Map([
            ["PaymentReceived", this.compensatePayment.bind(this)],
        ]);
    }

    private async onOrderPlaced(event: OrderPlaced): Promise<void> {
        this.state.orderId = event.orderId;
        this.state.amount = event.amount;

        // Dispatch command to request payment
        await this.dispatch(new RequestPayment(event.orderId, event.amount));
    }

    private async onPaymentReceived(event: PaymentReceived): Promise<void> {
        this.state.paymentId = event.paymentId;

        // Dispatch command to create shipment
        await this.dispatch(new CreateShipment(this.state.orderId!));
    }

    private async onShipmentCreated(event: ShipmentCreated): Promise<void> {
        // Workflow complete
        this.complete();
    }

    private async compensatePayment(): Promise<void> {
        // Refund the payment if saga fails after payment
        await this.dispatch(new RefundPayment(this.state.paymentId!));
    }
}
```

## Registering Sagas

Register your saga with the `SagaManager`:

```typescript
import { Application } from "hollywood-js";

const sagaManager = new Application.SagaManager(
    commandBus,
    sagaRepository  // Optional: for persistence
);

// Register the saga
sagaManager.register(
    OrderFulfillmentSaga,
    (sagaId, correlationId) => new OrderFulfillmentSaga(
        sagaId,
        {}, // initial state
        correlationId
    ),
    OrderFulfillmentSaga.startedBy(),
    (message) => message.uuid  // correlation ID extractor
);

// Attach to event bus
eventBus.addListener(sagaManager);
```

## Saga Lifecycle

```
PENDING → RUNNING → COMPLETED
              ↓
         COMPENSATING → FAILED
```

1. **PENDING**: Initial state when saga is created
2. **RUNNING**: Saga is actively processing events
3. **COMPENSATING**: Saga is running compensation handlers after failure
4. **COMPLETED**: Saga finished successfully
5. **FAILED**: Saga failed after compensation

## Idempotency

Sagas automatically track processed events to ensure idempotency. Each event is keyed by `eventType:aggregateId:playhead` and will only be processed once.

## Persistence

For production use, implement `ISagaRepository` to persist saga state:

```typescript
import { Application } from "hollywood-js";

class PostgresSagaRepository implements Application.ISagaRepository {
    async findById(sagaId: string): Promise<SagaStateSnapshot<any> | null> {
        // Load from database
    }

    async findByCorrelationId(correlationId: string): Promise<SagaStateSnapshot<any>[]> {
        // Find all sagas with this correlation ID
    }

    async save(snapshot: SagaStateSnapshot<any>): Promise<void> {
        // Save to database
    }

    async delete(sagaId: string): Promise<void> {
        // Delete from database
    }
}
```

## Module Configuration

```typescript
const services = new Map()
    .set("order.saga.repository", {
        instance: Application.InMemorySagaRepository,
    })
    .set("order.saga.manager", {
        instance: Application.SagaManager,
        deps: ["app.bus.command", "order.saga.repository"],
    });
```

---

**Next:** [Event Versioning](event-versioning.md)
