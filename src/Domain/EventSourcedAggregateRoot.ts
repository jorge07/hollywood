
import type IEventSourced from "./IEventSourced";
import DomainMessage from "./Event/DomainMessage";
import DomainEventStream from "./Event/DomainEventStream";
import EventSourced from "./EventSourced";
import DomainEvent from "./Event/DomainEvent";
import AggregateRoot from "./AggregateRoot";

export default abstract class EventSourcedAggregateRoot extends AggregateRoot implements IEventSourced {

    protected readonly methodPrefix: string = "apply";
    private playhead: number = -1;
    private events: DomainMessage[] = [];
    private children: EventSourced[] = [];

    public getUncommittedEvents(): DomainEventStream {
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

    public fromSnapshot(snapshot: any): EventSourcedAggregateRoot {
        const children = snapshot.children;
        delete snapshot.children;
        Object.assign(this, snapshot);
        this.children.map((child: EventSourced, key: number) => child.fromSnapshot(children[key]));
        return this;
    }

    public recursiveHandling(event: object|DomainEvent, method: string): void {
        this.handle(event, method);

        this.getChildEntities().forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, method);
        });
    }

    public version(): number {

        return this.playhead;
    }


    protected getChildEntities(): EventSourced[] {
        return this.children;
    }

    protected registerChildren(child: EventSourced): void {
        this.children.push(child)
    }

    protected raise(event: object|DomainEvent): void {
        const domainMessage: DomainMessage = DomainMessage.create(
            this.getAggregateRootId(),
            this.playhead,
            event,
        );

        this.recursiveHandling(event, this.methodToApplyEvent(domainMessage.eventType));

        this.playhead++;


        this.events.push(domainMessage);
    }

    private handle(event: object|DomainEvent, method: string): void {
        if ((this as any)[method]) {
            (this as any)[method](event);
        }
    }

    private methodToApplyEvent(eventName: string): string {

        return this.methodPrefix + eventName;
    }
}
