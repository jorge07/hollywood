import { DomainEvent } from './DomainEvent';

/** 
 * @internal class
 */
export class DomainMessage {

    private playhead: number
    private ocurredOn: Date

    constructor(
        public uuid: string,
        public event: DomainEvent,
        public metadata: Array<any> = []
    ) {
        this.playhead = event.playhead
        this.ocurredOn = event.ocurrendOn
    }

    static create(uuid: string, event: DomainEvent): DomainMessage {
        return new DomainMessage(uuid, event)
    }
}