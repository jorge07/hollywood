import { AggregateRootId } from "../AggregateRoot";
import DomainEvent from "./DomainEvent";

/**
 * @internal
 */
export default class DomainMessage {
    public static create(
        uuid: AggregateRootId,
        playhead: number,
        event: DomainEvent,
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
        public readonly event: DomainEvent,
        public readonly metadata: any[],
    ) {
        this.eventType = event.domainEventName();
        this.ocurredOn = new Date();
    }
}
