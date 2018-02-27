import { DomainEvent } from "./DomainEvent";

/**
 * @internal class
 */
export class DomainMessage {
    public static create(uuid: string, event: DomainEvent): DomainMessage {
        const instance = new DomainMessage();

        instance.uuid = uuid
        instance.event = event;
        instance.playhead = event.playhead;
        instance.ocurredOn = event.ocurrendOn;

        return instance;
    }

    public uuid: string;
    public event: DomainEvent;
    public metadata: any[] = [];
    public playhead: number;
    public ocurredOn: Date;
}
