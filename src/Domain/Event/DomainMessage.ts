import DomainEvent from "./DomainEvent";

/**
 * @internal
 */
export default class DomainMessage {
    public static create(
        uuid: string,
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

    public readonly ocurrendOn: Date;
    public readonly eventType: string;

    private constructor(
        public readonly uuid: string,
        public readonly playhead: number,
        public readonly event: DomainEvent,
        public readonly metadata: any[],
    ) {
        this.eventType = event.name();
        this.ocurrendOn = new Date();
    }
}
