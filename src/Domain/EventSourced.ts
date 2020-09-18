import { DomainEvent } from ".";
import IEventSourced from "./IEventSourced";

export default abstract class EventSourced implements IEventSourced {
    private children: EventSourced[] = [];
    public fromSnapshot(snapshot: EventSourced): EventSourced {

        Object.assign(this, snapshot);

        return this;
    }

    public recursiveHandling(event: object|DomainEvent, method: string): void {
        this.handle(event, method);

        this.getChildEntities().forEach((aggregate: EventSourced) => {
            aggregate.recursiveHandling(event, method);
        });
    }

    protected getChildEntities(): EventSourced[] {
        return this.children;
    }

    protected registerChildren(child: EventSourced): void {
        this.children.push(child)
    }

    private handle(event: object|DomainEvent, method: string): void {
        if ((this as any)[method]) {
            (this as any)[method](event);
        }
    }

}
