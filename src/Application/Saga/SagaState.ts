/**
 * Status of a saga instance throughout its lifecycle.
 */
export enum SagaStatus {
    /** Saga has been created but not yet started */
    PENDING = 'pending',
    /** Saga is actively processing events */
    RUNNING = 'running',
    /** Saga has completed successfully */
    COMPLETED = 'completed',
    /** Saga has failed and compensation may be needed */
    FAILED = 'failed',
    /** Saga is executing compensating transactions */
    COMPENSATING = 'compensating'
}

/**
 * Snapshot of a saga's state for persistence.
 */
export interface SagaStateSnapshot<TState = unknown> {
    readonly sagaId: string;
    readonly sagaType: string;
    readonly status: SagaStatus;
    readonly state: TState;
    readonly correlationId: string;
    readonly startedAt: Date;
    readonly updatedAt: Date;
    readonly completedAt?: Date;
    readonly failureReason?: string;
    readonly processedEvents: string[];
}

/**
 * Result of a saga step execution.
 */
export interface SagaStepResult {
    readonly success: boolean;
    readonly error?: Error;
}
