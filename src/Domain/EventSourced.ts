import { AggregateRoot, DomainEvent, DomainEventStream, DomainMessage } from ".";

export default abstract class EventSourced extends AggregateRoot {

    protected readonly methodPrefix: string = "apply";
    protected aggregates: EventSourced[] = [];
    private playhead: number = -1;
    private events: DomainMessage[] = [];

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

    public fromSnapshot(snapshot: EventSourced): EventSourced {

        const aggregates: EventSourced[] = snapshot.aggregates;
        delete snapshot.aggregates;

        Object.assign(this, snapshot);

        aggregates.forEach((element, index: number) => {

            this.aggregates[index].fromSnapshot(element);
        });

        return this;
    }

    public recursiveHandling(event: DomainEvent, method: string): void {
        this.handle(event, method);

        this.aggregates.forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, method);
        });
    }

    public version(): number {

        return this.playhead;
    }

    protected registerChild(child: EventSourced): void {
        this.aggregates.push(child);
    }

    protected raise(event: DomainEvent): void {
        this.recursiveHandling(event, this.methodToApplyEvent(event.domainEventName()));

        this.playhead++;
        const domainMessage: DomainMessage = DomainMessage.create(
            this.getAggregateRootId(),
            this.playhead,
            event,
        );

        this.events.push(domainMessage);
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
