import type { SagaStateSnapshot } from "./SagaState";

/**
 * Repository interface for saga persistence.
 * Implementations handle storage and retrieval of saga state.
 */
export default interface ISagaRepository {
    /**
     * Save a saga state snapshot.
     * @param snapshot The saga state to persist
     */
    save(snapshot: SagaStateSnapshot): Promise<void>;

    /**
     * Load a saga by its unique identifier.
     * @param sagaId The saga's unique identifier
     * @returns The saga state snapshot or undefined if not found
     */
    load(sagaId: string): Promise<SagaStateSnapshot | undefined>;

    /**
     * Find sagas by correlation ID.
     * Multiple sagas may share the same correlation ID.
     * @param correlationId The correlation ID to search for
     * @returns Array of matching saga state snapshots
     */
    findByCorrelationId(correlationId: string): Promise<SagaStateSnapshot[]>;

    /**
     * Find sagas that are interested in a specific event type.
     * Used for event routing to active sagas.
     * @param eventType The event type name
     * @param correlationId Optional correlation ID to filter results
     * @returns Array of matching saga state snapshots
     */
    findByEventType(eventType: string, correlationId?: string): Promise<SagaStateSnapshot[]>;

    /**
     * Delete a saga state (used after completion if cleanup is desired).
     * @param sagaId The saga's unique identifier
     */
    delete(sagaId: string): Promise<void>;
}
