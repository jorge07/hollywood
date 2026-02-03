import type ISagaRepository from "./SagaRepository";
import type { SagaStateSnapshot } from "./SagaState";

/**
 * In-memory implementation of the saga repository.
 * Useful for testing and development.
 *
 * Note: This implementation does not persist data across process restarts.
 * For production use, implement ISagaRepository with a persistent store.
 */
export default class InMemorySagaRepository implements ISagaRepository {
    private readonly sagas: Map<string, SagaStateSnapshot> = new Map();
    private readonly correlationIndex: Map<string, Set<string>> = new Map();

    public async save(snapshot: SagaStateSnapshot): Promise<void> {
        // Deep clone to prevent external mutations
        const clonedSnapshot = JSON.parse(JSON.stringify(snapshot)) as SagaStateSnapshot;

        this.sagas.set(snapshot.sagaId, clonedSnapshot);

        // Update correlation index
        const correlationSagas = this.correlationIndex.get(snapshot.correlationId) || new Set();
        correlationSagas.add(snapshot.sagaId);
        this.correlationIndex.set(snapshot.correlationId, correlationSagas);
    }

    public async load(sagaId: string): Promise<SagaStateSnapshot | undefined> {
        const snapshot = this.sagas.get(sagaId);
        if (!snapshot) {
            return undefined;
        }

        // Return a deep clone to prevent external mutations
        return JSON.parse(JSON.stringify(snapshot)) as SagaStateSnapshot;
    }

    public async findByCorrelationId(correlationId: string): Promise<SagaStateSnapshot[]> {
        const sagaIds = this.correlationIndex.get(correlationId);
        if (!sagaIds || sagaIds.size === 0) {
            return [];
        }

        const results: SagaStateSnapshot[] = [];
        for (const sagaId of sagaIds) {
            const snapshot = this.sagas.get(sagaId);
            if (snapshot) {
                // Return deep clones to prevent external mutations
                results.push(JSON.parse(JSON.stringify(snapshot)) as SagaStateSnapshot);
            }
        }

        return results;
    }

    public async findByEventType(eventType: string, correlationId?: string): Promise<SagaStateSnapshot[]> {
        const results: SagaStateSnapshot[] = [];

        for (const snapshot of this.sagas.values()) {
            // Filter by correlation ID if provided
            if (correlationId && snapshot.correlationId !== correlationId) {
                continue;
            }

            // Return deep clones to prevent external mutations
            results.push(JSON.parse(JSON.stringify(snapshot)) as SagaStateSnapshot);
        }

        return results;
    }

    public async delete(sagaId: string): Promise<void> {
        const snapshot = this.sagas.get(sagaId);
        if (snapshot) {
            // Remove from correlation index
            const correlationSagas = this.correlationIndex.get(snapshot.correlationId);
            if (correlationSagas) {
                correlationSagas.delete(sagaId);
                if (correlationSagas.size === 0) {
                    this.correlationIndex.delete(snapshot.correlationId);
                }
            }
        }

        this.sagas.delete(sagaId);
    }

    /**
     * Clear all stored sagas.
     * Useful for testing.
     */
    public clear(): void {
        this.sagas.clear();
        this.correlationIndex.clear();
    }

    /**
     * Get the number of stored sagas.
     * Useful for testing.
     */
    public count(): number {
        return this.sagas.size;
    }
}
