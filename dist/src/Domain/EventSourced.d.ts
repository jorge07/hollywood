import type IEventSourced from "./IEventSourced";
import DomainEvent from "./Event/DomainEvent";
export default abstract class EventSourced implements IEventSourced {
    private children;
    fromSnapshot(snapshot: EventSourced): EventSourced;
    recursiveHandling(event: object | DomainEvent, method: string): void;
    protected getChildEntities(): EventSourced[];
    protected registerChildren(child: EventSourced): void;
    private handle;
}
