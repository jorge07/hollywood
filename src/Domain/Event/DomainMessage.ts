import { AggregateRootId } from "../AggregateRoot";
import type DomainEvent from "./DomainEvent";

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
    ): DomainMessage {
        return new DomainMessage(
            uuid,
            playhead,
            event,
            metadata,
            occurred ?? new Date(),
        );
    }

    public readonly eventType: string;

    private constructor(
        public readonly uuid: AggregateRootId,
        public readonly playhead: number,
        public readonly event: object|DomainEvent,
        public readonly metadata: any[],
        public readonly occurred: Date = new Date(),
    ) {
        this.eventType = DomainMessage.extractEventType(event);
    }

    private static extractEventType(event: object) {
        return event.constructor.name;
    }
}
