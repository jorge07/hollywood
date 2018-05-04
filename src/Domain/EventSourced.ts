import { AggregateRoot, DomainEvent, DomainEventStream, DomainMessage } from ".";

export default abstract class EventSourced extends AggregateRoot {

    protected readonly methodPrefix: string = "apply";
    protected aggregates: EventSourced[] = [];
    private playhead: number = -1;
    private events: DomainMessage[] = [];

    public registerChild(child: EventSourced) {
        this.aggregates.push(child);
    }

    public getUncommitedEvents(): DomainEventStream {
        const stream = new DomainEventStream(this.events);
        this.events = [];

        return stream;
    }

    public fromHistory(stream: DomainEventStream): any {
        stream.events.forEach(
            (message: DomainMessage) => {
                this.playhead++;
                this.recursiveHandling(
                    message.event,
                    this.methodToApplyEvent(message.eventType),
                );
            },
        );

        return this;
    }

    public version(): number {

        return this.playhead;
    }

    protected raise(event: DomainEvent): void {

        this.recursiveHandling(event, this.methodToApplyEvent(event.name()));

        this.playhead++;
        const domainMessage: DomainMessage = DomainMessage.create(
            this.getAggregateRootId(),
            this.playhead,
            event,
        );

        this.events.push(domainMessage);
    }

    protected recursiveHandling(event: DomainEvent, method: string): void {
        this.handle(event, method);

        this.aggregates.forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, method);
        });
    }

    private handle(event: DomainEvent, method: string): void {
        if (this[method]) {
            this[method](event);
        }
    }

    private methodToApplyEvent(eventName: string): string {

        return this.methodPrefix + eventName;
    }
}
