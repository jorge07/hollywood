import type IEventSourced from "./IEventSourced";
import DomainEventStream from "./Event/DomainEventStream";
import EventSourced from "./EventSourced";
import DomainEvent from "./Event/DomainEvent";
import AggregateRoot from "./AggregateRoot";
export default abstract class EventSourcedAggregateRoot extends AggregateRoot implements IEventSourced {
    protected readonly methodPrefix: string;
    private playhead;
    private events;
    private children;
    getUncommittedEvents(): DomainEventStream;
    fromHistory(stream: DomainEventStream): any;
    fromSnapshot(snapshot: any): EventSourcedAggregateRoot;
    recursiveHandling(event: object | DomainEvent, method: string): void;
    version(): number;
    protected getChildEntities(): EventSourced[];
    protected registerChildren(child: EventSourced): void;
    protected raise(event: object | DomainEvent): void;
    private handle;
    private methodToApplyEvent;
}
