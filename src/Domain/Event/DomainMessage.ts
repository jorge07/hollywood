import { AggregateRootId } from "../AggregateRoot";
import DomainEvent from "./DomainEvent";

/**
 * @internal
 */
export default class DomainMessage {
    public static create(
        uuid: AggregateRootId,
        playhead: number,
        event: object|DomainEvent,
        metadata: any[] = [],
    ): DomainMessage {
        return new DomainMessage(
            uuid,
            playhead,
            event,
            metadata,
        );
    }

    public readonly occurred: Date;
    public readonly eventType: string;

    private constructor(
        public readonly uuid: AggregateRootId,
        public readonly playhead: number,
        public readonly event: object|DomainEvent,
        public readonly metadata: any[],
    ) {
        this.eventType = DomainMessage.extractEventType(event);
        this.occurred = new Date();
    }

    private static extractEventType(event: object) {
        return event.constructor.name;
    }
}
