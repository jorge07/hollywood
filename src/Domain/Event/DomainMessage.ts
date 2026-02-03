import type DomainEvent from "./DomainEvent";

/**
 * Generates a unique idempotency key based on aggregate ID, playhead, event type, and timestamp.
 * This creates a deterministic key that can be used to detect duplicate event processing.
 */
function generateIdempotencyKey(
    uuid: string,
    playhead: number,
    eventType: string,
    occurred: Date,
): string {
    const timestamp = occurred.getTime();
    const content = `${uuid}:${playhead}:${eventType}:${timestamp}`;
    // Simple hash function for generating a unique key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return `${uuid}-${playhead}-${Math.abs(hash).toString(16)}`;
}

/**
 * Wrapper for domain events that adds metadata for event sourcing.
 *
 * DomainMessage encapsulates a domain event along with:
 * - Aggregate ID (uuid) - derived from event.aggregateId
 * - Sequence number (playhead)
 * - Occurrence timestamp - derived from event.occurredAt
 * - Idempotency key
 * - Optional metadata
 *
 * The event property accepts both DomainEvent instances and plain objects
 * to support deserialization from event stores where events lose their
 * class prototypes after JSON serialization.
 *
 * Note: uuid and occurred are derived from the event's aggregateId and occurredAt.
 * This ensures consistency between the event and its metadata wrapper.
 *
 * @internal
 */
export default class DomainMessage {
    public static create(
        uuid: string,
        playhead: number,
        event: DomainEvent,
        metadata: any[] = [],
        occurred?: Date,
        idempotencyKey?: string,
    ): DomainMessage {
        return new DomainMessage(
            uuid,
            playhead,
            event,
            metadata,
            occurred ?? event.occurredAt,
            idempotencyKey,
        );
    }

    public readonly eventType: string;
    public readonly idempotencyKey: string;

    private constructor(
        public readonly uuid: string,
        public readonly playhead: number,
        public readonly event: DomainEvent,
        public readonly metadata: any[],
        public readonly occurred: Date,
        idempotencyKey?: string,
    ) {
        this.eventType = DomainMessage.extractEventType(event);
        this.idempotencyKey = idempotencyKey ?? generateIdempotencyKey(
            uuid,
            playhead,
            this.eventType,
            this.occurred,
        );
    }

    private static extractEventType(event: DomainEvent): string {
        return event.constructor.name;
    }
}
