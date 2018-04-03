import { DomainEvent, DomainEventStream, DomainMessage } from ".";

export abstract class AggregateRoot {

    public abstract getAggregateRootId(): string;
}

export default abstract class EventSourced extends AggregateRoot {
    
    protected readonly methodPrefix: string = "apply";
    private playhead: number = -1;
    private events: DomainEvent[] = [];

    public raise(event: DomainEvent): void {
        this.playhead++;
        this.applyEvent(event);
        this.events.push(event);
    }

    public getUncommitedEvents(): DomainEventStream {
        const id = this.getAggregateRootId();
        const events = this.events.map((event: DomainEvent) => (DomainMessage.create(id, event)));
        this.events = [];

        return new DomainEventStream(events);
    }

    public fromHistory(stream: DomainEventStream): any {
        stream.events.forEach(
            (message: DomainMessage) => {
                this.playhead++;
                this.applyDomainMessage(message)
            }
        );

        return this;
    }

    protected applyEvent(event: DomainEvent): void {
        event.playhead = this.playhead;
        this.applyDomainMessage(DomainMessage.create(this.getAggregateRootId(), event));
    }

    private applyDomainMessage(message: DomainMessage): void {
        const method: string = this.methodToApplyEvent(message);
                
        if (this[method]) {
            this[method](message.event);
        }
    }

    private methodToApplyEvent(message: DomainMessage): string {

        return this.methodPrefix + message.eventType;
    }
}

