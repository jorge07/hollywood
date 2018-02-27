import { DomainEvent, DomainEventStream, DomainMessage } from ".";

export abstract class AggregateRoot {
    protected methodPrefix: string = "apply";
    private playhead: number = -1;
    private events: DomainEvent[] = [];

    public abstract getAggregateRootId(): string;

    public raise(event: DomainEvent): void {
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
        stream.events.forEach((message: DomainMessage) => this.applyEvent(message.event));

        return this;
    }

    protected applyEvent(event: DomainEvent): void {
        this.playhead++;
        event.playhead = this.playhead;

        const method: string = this.methodToApplyEvent(event);

        if (this[method]) {
            this[method](event);
        }
    }

    protected methodToApplyEvent(event: DomainEvent): string | null {
        const name: string = this.eventName(event);

        return this.methodPrefix + name;
    }

    private eventName(event: DomainEvent): string {
        return  (event as any).constructor.name;
    }

}
