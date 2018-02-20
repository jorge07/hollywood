import { DomainEvent } from './Event/DomainEvent';
import { DomainEventStream } from './Event/DomainEventStream';
import { DomainMessage } from './Event/DomainMessage';

export abstract class AggregateRoot {
    private _playhead: number = -1;
    private _events: Array<DomainEvent> =[];
    protected _methodPrefix: string = 'apply';
    
    abstract getAggregateRootId() : string

    playhead(): number {
        return this._playhead
    }

    raise(event: DomainEvent): void {
        this.applyEvent(event);
        this._events.push(event)
    }
    
    getUncommitedEvents(): DomainEventStream {
        const id = this.getAggregateRootId();
        const events = this._events.map((event: DomainEvent) => (DomainMessage.create(id, event)));
        this._events = [];

        return new DomainEventStream(events)
    }

    fromHistory(stream: DomainEventStream): any {
        stream.events.forEach((message: DomainMessage) => this.applyEvent(message.event));
        return this
    }

    protected applyEvent(event: DomainEvent): void {
        this._playhead++;
        event.playhead = this._playhead;

        const method: string = this.methodToApplyEvent(event);

        if (this[method]) {
            this[method](event)
        }
    }

    protected methodToApplyEvent(event: DomainEvent): string | null {

        const name: string = AggregateRoot.eventName(event);

        return this._methodPrefix + name
    }

    private static eventName(event: DomainEvent): string {
        return  (<any> event).constructor.name;
    }
}
