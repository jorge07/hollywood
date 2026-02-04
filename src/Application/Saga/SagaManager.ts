import type DomainMessage from "../../Domain/Event/DomainMessage";
import type DomainEvent from "../../Domain/Event/DomainEvent";
import type ICommand from "../Bus/Command/Command";
import type CommandBus from "../Bus/Command/CommandBus";
import type Saga from "./Saga";
import type ISagaRepository from "./SagaRepository";
import { SagaStatus } from "./SagaState";
import type { SagaStateSnapshot } from "./SagaState";
import EventListener from "../../EventSourcing/EventBus/EventListener";

/**
 * Factory function type for creating saga instances.
 */
export type SagaFactory<TState, TSaga extends Saga<TState>> = (
    sagaId: string,
    correlationId: string,
) => TSaga;

/**
 * Correlation ID extractor function type.
 * Extracts the correlation ID from an event for saga routing.
 */
export type CorrelationIdExtractor = (event: DomainEvent) => string;

/**
 * Saga type registration information.
 */
interface SagaRegistration<TState = unknown, TSaga extends Saga<TState> = Saga<TState>> {
    readonly sagaType: string;
    readonly factory: SagaFactory<TState, TSaga>;
    readonly startingEvents: string[];
    readonly correlationIdExtractor: CorrelationIdExtractor;
}

/**
 * Manages the lifecycle of sagas (process managers).
 *
 * Responsibilities:
 * - Start new sagas when starting events occur
 * - Route events to active sagas
 * - Handle saga completion and failure
 * - Persist saga state
 * - Trigger compensating transactions
 *
 * @example
 * ```typescript
 * const sagaManager = new SagaManager(commandBus, sagaRepository);
 *
 * sagaManager.register(
 *   'OrderFulfillmentSaga',
 *   (id, correlationId) => new OrderFulfillmentSaga(id, {}, correlationId),
 *   ['OrderPlaced'],
 *   (event) => event.orderId
 * );
 *
 * eventBus.addListener(sagaManager);
 * ```
 */
export default class SagaManager extends EventListener {
    /** Registered saga types */
    private readonly registrations: Map<string, SagaRegistration> = new Map();

    /** Event type to saga types mapping for starting events */
    private readonly startingEventMap: Map<string, string[]> = new Map();

    /** Event type to saga types mapping for all interested events */
    private readonly eventInterestMap: Map<string, string[]> = new Map();

    /** In-memory cache of active sagas */
    private readonly activeSagas: Map<string, Saga<unknown>> = new Map();

    constructor(
        private readonly commandBus: CommandBus,
        private readonly repository: ISagaRepository,
    ) {
        super();
    }

    /**
     * Register a saga type with the manager.
     *
     * @param sagaType The unique identifier for this saga type
     * @param factory Factory function to create saga instances
     * @param startingEvents Events that can start this saga
     * @param correlationIdExtractor Function to extract correlation ID from events
     */
    public register<TState, TSaga extends Saga<TState>>(
        sagaType: string,
        factory: SagaFactory<TState, TSaga>,
        startingEvents: string[],
        correlationIdExtractor: CorrelationIdExtractor,
    ): SagaManager {
        // Create a temporary saga to get the events it's interested in
        const tempSaga = factory('temp', 'temp');
        const interestedEvents = tempSaga.interestedIn();

        const registration: SagaRegistration<TState, TSaga> = {
            sagaType,
            factory,
            startingEvents,
            correlationIdExtractor,
        };

        this.registrations.set(sagaType, registration as SagaRegistration);

        // Map starting events to saga types
        for (const eventType of startingEvents) {
            const existing = this.startingEventMap.get(eventType) || [];
            if (!existing.includes(sagaType)) {
                existing.push(sagaType);
                this.startingEventMap.set(eventType, existing);
            }
        }

        // Map all interested events to saga types
        for (const eventType of interestedEvents) {
            const existing = this.eventInterestMap.get(eventType) || [];
            if (!existing.includes(sagaType)) {
                existing.push(sagaType);
                this.eventInterestMap.set(eventType, existing);
            }
        }

        return this;
    }

    /**
     * Handle an incoming domain event.
     * Implements EventListener interface.
     *
     * @param message The domain message containing the event
     */
    public async on(message: DomainMessage): Promise<void> {
        const eventType = message.eventType;

        // Check if this event can start any sagas
        await this.handleStartingEvent(message, eventType);

        // Route event to active sagas
        await this.routeEventToSagas(message, eventType);
    }

    /**
     * Handle events that can start new sagas.
     */
    private async handleStartingEvent(message: DomainMessage, eventType: string): Promise<void> {
        const sagaTypes = this.startingEventMap.get(eventType);
        if (!sagaTypes || sagaTypes.length === 0) {
            return;
        }

        for (const sagaType of sagaTypes) {
            const registration = this.registrations.get(sagaType);
            if (!registration) {
                continue;
            }

            const correlationId = registration.correlationIdExtractor(message.event);

            // Check if a saga already exists for this correlation ID
            const existingSagas = await this.repository.findByCorrelationId(correlationId);
            const existingSaga = existingSagas.find(
                s => s.sagaType === sagaType && s.status !== SagaStatus.COMPLETED && s.status !== SagaStatus.FAILED
            );

            if (existingSaga) {
                // Saga already exists, route the event to it
                continue;
            }

            // Create new saga
            const sagaId = this.generateSagaId();
            const saga = registration.factory(sagaId, correlationId);
            this.setupSaga(saga);

            // Handle the starting event
            await saga.handle(message);

            // Persist the saga
            await this.persistSaga(saga);

            // Cache if still active
            if (saga.isActive()) {
                this.activeSagas.set(sagaId, saga);
            }
        }
    }

    /**
     * Route an event to all interested active sagas.
     */
    private async routeEventToSagas(message: DomainMessage, eventType: string): Promise<void> {
        const sagaTypes = this.eventInterestMap.get(eventType);
        if (!sagaTypes || sagaTypes.length === 0) {
            return;
        }

        for (const sagaType of sagaTypes) {
            const registration = this.registrations.get(sagaType);
            if (!registration) {
                continue;
            }

            const correlationId = registration.correlationIdExtractor(message.event);

            // Find active sagas for this correlation ID
            const sagaSnapshots = await this.repository.findByCorrelationId(correlationId);
            const activeSagaSnapshots = sagaSnapshots.filter(
                s => s.sagaType === sagaType &&
                    s.status !== SagaStatus.COMPLETED &&
                    s.status !== SagaStatus.FAILED
            );

            for (const snapshot of activeSagaSnapshots) {
                let saga = this.activeSagas.get(snapshot.sagaId);

                if (!saga) {
                    // Rehydrate saga from snapshot
                    saga = registration.factory(snapshot.sagaId, snapshot.correlationId);
                    saga.fromSnapshot(snapshot);
                    this.setupSaga(saga);
                    this.activeSagas.set(snapshot.sagaId, saga);
                }

                await saga.handle(message);
                await this.persistSaga(saga);

                // Remove from cache if no longer active
                if (!saga.isActive()) {
                    this.activeSagas.delete(snapshot.sagaId);
                }
            }
        }
    }

    /**
     * Setup a saga with the command dispatcher.
     */
    private setupSaga(saga: Saga<unknown>): void {
        saga.setCommandDispatcher(this.createCommandDispatcher());
    }

    /**
     * Create a command dispatcher function.
     */
    private createCommandDispatcher(): (command: ICommand) => Promise<void> {
        return async (command: ICommand): Promise<void> => {
            await this.commandBus.handle(command);
        };
    }

    /**
     * Persist a saga's current state.
     */
    private async persistSaga(saga: Saga<unknown>): Promise<void> {
        const snapshot = saga.toSnapshot();
        await this.repository.save(snapshot);
    }

    /**
     * Generate a unique saga ID.
     */
    private generateSagaId(): string {
        return `saga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get the current status of a saga by ID.
     */
    public async getSagaStatus(sagaId: string): Promise<SagaStateSnapshot | undefined> {
        return this.repository.load(sagaId);
    }

    /**
     * Get all active sagas for a correlation ID.
     */
    public async getActiveSagasForCorrelation(correlationId: string): Promise<SagaStateSnapshot[]> {
        const snapshots = await this.repository.findByCorrelationId(correlationId);
        return snapshots.filter(
            s => s.status !== SagaStatus.COMPLETED && s.status !== SagaStatus.FAILED
        );
    }
}
