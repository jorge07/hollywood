import DomainEvent from "./DomainEvent";

/**
 * @internal
 */
export default class DomainMessage {

    private constructor(
        public readonly uuid: string, 
        public readonly event: DomainEvent, 
        public readonly playhead: number, 
        public readonly ocurredOn: Date,
        public readonly metadata: any[] = []
    ) {
    }

    public static create(uuid: string, event: DomainEvent): DomainMessage {
        return new DomainMessage(
            uuid,
            event,
            event.playhead,
            event.ocurrendOn
        );
    }
}
