import { AggregateRootId } from "../AggregateRoot";
import type DomainEvent from "./DomainEvent";

/**
 * Generates a unique idempotency key based on aggregate ID, playhead, event type, and timestamp.
 * This creates a deterministic key that can be used to detect duplicate event processing.
 */
function generateIdempotencyKey(
    uuid: AggregateRootId,
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
 * @internal
 */
export default class DomainMessage {
    public static create(
        uuid: AggregateRootId,
        playhead: number,
        event: object|DomainEvent,
        metadata: any[] = [],
        occurred?: Date,
        idempotencyKey?: string,
    ): DomainMessage {
        return new DomainMessage(
            uuid,
            playhead,
            event,
            metadata,
            occurred ?? new Date(),
            idempotencyKey,
        );
    }

    public readonly eventType: string;
    public readonly idempotencyKey: string;

    private constructor(
        public readonly uuid: AggregateRootId,
        public readonly playhead: number,
        public readonly event: object|DomainEvent,
        public readonly metadata: any[],
        public readonly occurred: Date = new Date(),
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

    private static extractEventType(event: object) {
        return event.constructor.name;
    }
}
