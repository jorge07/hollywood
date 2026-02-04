import type ICommand from "../Bus/Command/Command";
import type DomainMessage from "../../Domain/Event/DomainMessage";
import { SagaStatus } from "./SagaState";
import type { SagaStateSnapshot } from "./SagaState";

/**
 * Command dispatcher function type.
 * Provided by the SagaManager to execute commands.
 */
export type CommandDispatcher = (command: ICommand) => Promise<void>;

import type DomainEvent from "../../Domain/Event/DomainEvent";

/**
 * Abstract base class for implementing sagas (process managers).
 *
 * Sagas coordinate long-running business processes across multiple aggregates.
 * They listen to domain events and dispatch commands to progress the workflow.
 *
 * @example
 * ```typescript
 * class OrderFulfillmentSaga extends Saga<OrderFulfillmentState> {
 *   readonly sagaType = 'OrderFulfillmentSaga';
 *
 *   static startedBy(): string[] {
 *     return ['OrderPlaced'];
 *   }
 *
 *   protected getEventHandlers(): Map<string, (event: DomainEvent) => Promise<void>> {
 *     return new Map([
 *       ['OrderPlaced', this.onOrderPlaced.bind(this)],
 *       ['PaymentReceived', this.onPaymentReceived.bind(this)],
 *       ['ShipmentCreated', this.onShipmentCreated.bind(this)],
 *     ]);
 *   }
 *
 *   protected getCompensationHandlers(): Map<string, () => Promise<void>> {
 *     return new Map([
 *       ['PaymentReceived', this.compensatePayment.bind(this)],
 *     ]);
 *   }
 * }
 * ```
 */
export default abstract class Saga<TState = unknown> {
    /** Unique identifier for this saga instance */
    private _sagaId: string;

    /** The saga's internal state */
    protected state: TState;

    /** Current status of the saga */
    protected status: SagaStatus = SagaStatus.PENDING;

    /** Correlation ID for grouping related sagas/events */
    protected correlationId: string;

    /** Timestamp when the saga was started */
    protected startedAt: Date;

    /** Timestamp of the last update */
    protected updatedAt: Date;

    /** Timestamp when the saga completed */
    protected completedAt?: Date;

    /** Reason for failure if the saga failed */
    protected failureReason?: string;

    /** List of processed event types for idempotency */
    protected processedEvents: string[] = [];

    /** Command dispatcher provided by the SagaManager */
    private commandDispatcher?: CommandDispatcher;

    /**
     * The saga type identifier (class name).
     * Used for persistence and routing.
     */
    abstract readonly sagaType: string;

    /**
     * Get the unique identifier for this saga instance.
     */
    get sagaId(): string {
        return this._sagaId;
    }

    constructor(sagaId: string, initialState: TState, correlationId: string) {
        this._sagaId = sagaId;
        this.state = initialState;
        this.correlationId = correlationId;
        this.startedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Returns the event types that can start this saga.
     * Override in subclass to specify starting events.
     */
    static startedBy(): string[] {
        return [];
    }

    /**
     * Returns the event types this saga listens to.
     * Derived from the event handlers map.
     */
    public interestedIn(): string[] {
        return Array.from(this.getEventHandlers().keys());
    }

    /**
     * Handle an incoming domain event.
     * Routes to the appropriate handler based on event type.
     * @param message The domain message containing the event
     */
    public async handle(message: DomainMessage): Promise<void> {
        // Don't process events if saga is already finished
        if (this.status === SagaStatus.COMPLETED || this.status === SagaStatus.FAILED) {
            return;
        }

        const eventType = message.eventType;
        const handlers = this.getEventHandlers();
        const handler = handlers.get(eventType);

        if (!handler) {
            return;
        }

        // Idempotency check - use combination of event type and playhead
        const eventKey = `${eventType}:${message.uuid}:${message.playhead}`;
        if (this.processedEvents.includes(eventKey)) {
            return;
        }

        if (this.status === SagaStatus.PENDING) {
            this.status = SagaStatus.RUNNING;
        }

        try {
            await handler(message.event);
            this.processedEvents.push(eventKey);
            this.updatedAt = new Date();
        } catch (error) {
            await this.fail(error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /**
     * Set the command dispatcher.
     * Called by the SagaManager when the saga is registered.
     * @internal
     */
    public setCommandDispatcher(dispatcher: CommandDispatcher): void {
        this.commandDispatcher = dispatcher;
    }

    /**
     * Dispatch a command to progress the saga.
     * @param command The command to dispatch
     */
    protected async dispatch(command: ICommand): Promise<void> {
        if (!this.commandDispatcher) {
            throw new Error('Command dispatcher not set. Saga must be managed by SagaManager.');
        }

        if (this.status === SagaStatus.COMPLETED || this.status === SagaStatus.FAILED) {
            throw new Error(`Cannot dispatch command: saga is ${this.status}`);
        }

        await this.commandDispatcher(command);
    }

    /**
     * Mark the saga as completed.
     * No more events will be processed after completion.
     */
    protected complete(): void {
        if (this.status === SagaStatus.COMPLETED) {
            return;
        }

        this.status = SagaStatus.COMPLETED;
        this.completedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Mark the saga as failed and trigger compensation.
     * @param reason The reason for failure
     */
    protected async fail(reason: string): Promise<void> {
        if (this.status === SagaStatus.FAILED || this.status === SagaStatus.COMPENSATING) {
            return;
        }

        this.failureReason = reason;
        this.status = SagaStatus.COMPENSATING;
        this.updatedAt = new Date();

        await this.runCompensation();

        this.status = SagaStatus.FAILED;
        this.completedAt = new Date();
        this.updatedAt = new Date();
    }

    /**
     * Run compensation handlers in reverse order of processed events.
     */
    private async runCompensation(): Promise<void> {
        const compensationHandlers = this.getCompensationHandlers();

        // Run compensation in reverse order of processed events
        const reversedEvents = [...this.processedEvents].reverse();

        for (const eventKey of reversedEvents) {
            const eventType = eventKey.split(':')[0];
            const compensationHandler = compensationHandlers.get(eventType);

            if (compensationHandler) {
                try {
                    await compensationHandler();
                } catch (error) {
                    // Log compensation failure but continue with other compensations
                    console.error(`Compensation failed for ${eventType}:`, error);
                }
            }
        }
    }

    /**
     * Get the current status of the saga.
     */
    public getStatus(): SagaStatus {
        return this.status;
    }

    /**
     * Check if the saga is still active (not completed or failed).
     */
    public isActive(): boolean {
        return this.status !== SagaStatus.COMPLETED && this.status !== SagaStatus.FAILED;
    }

    /**
     * Create a snapshot of the saga state for persistence.
     */
    public toSnapshot(): SagaStateSnapshot<TState> {
        return {
            sagaId: this._sagaId,
            sagaType: this.sagaType,
            status: this.status,
            state: this.state,
            correlationId: this.correlationId,
            startedAt: this.startedAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt,
            failureReason: this.failureReason,
            processedEvents: [...this.processedEvents],
        };
    }

    /**
     * Restore saga state from a snapshot.
     * @param snapshot The snapshot to restore from
     */
    public fromSnapshot(snapshot: SagaStateSnapshot<TState>): void {
        this._sagaId = snapshot.sagaId;
        this.status = snapshot.status;
        this.state = snapshot.state;
        this.correlationId = snapshot.correlationId;
        this.startedAt = new Date(snapshot.startedAt);
        this.updatedAt = new Date(snapshot.updatedAt);
        this.completedAt = snapshot.completedAt ? new Date(snapshot.completedAt) : undefined;
        this.failureReason = snapshot.failureReason;
        this.processedEvents = [...snapshot.processedEvents];
    }

    /**
     * Get the map of event type to handler function.
     * Override in subclass to define event handlers.
     */
    protected abstract getEventHandlers(): Map<string, (event: DomainEvent) => Promise<void>>;

    /**
     * Get the map of event type to compensation handler function.
     * Override in subclass to define compensation logic.
     * Compensation handlers are called in reverse order when the saga fails.
     */
    protected getCompensationHandlers(): Map<string, () => Promise<void>> {
        return new Map();
    }
}
