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

    public readonly ocurredOn: Date;
    public readonly eventType: string;

    private constructor(
        public readonly uuid: AggregateRootId,
        public readonly playhead: number,
        public readonly event: object|DomainEvent,
        public readonly metadata: any[],
    ) {
        this.eventType = this.extractEventType(event);
        this.ocurredOn = new Date();
    }

    private extractEventType(event: object|DomainEvent) {
        return event.constructor.name;
    }
}
