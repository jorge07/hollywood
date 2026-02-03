
import type IEventSourced from "./IEventSourced";
import DomainMessage from "./Event/DomainMessage";
import DomainEventStream from "./Event/DomainEventStream";
import EventSourced from "./EventSourced";
import type DomainEvent from "./Event/DomainEvent";
import AggregateRoot from "./AggregateRoot";

export default abstract class EventSourcedAggregateRoot extends AggregateRoot implements IEventSourced {

    protected readonly methodPrefix: string = "apply";
    protected readonly eventHandlers = new Map<string, (event: DomainEvent) => void>();
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
        this.children.forEach((child: EventSourced, key: number) => child.fromSnapshot(children[key]));
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

    /**
     * Register an explicit event handler for a specific event type.
     * This is the preferred approach over the legacy apply* method pattern.
     */
    protected registerHandler<T extends DomainEvent>(
        eventType: new (...args: any[]) => T,
        handler: (event: T) => void
    ): void {
        this.eventHandlers.set(eventType.name, handler as (event: DomainEvent) => void);
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
        const eventName = event.constructor.name;
        const handler = this.eventHandlers.get(eventName);

        if (handler) {
            handler(event as DomainEvent);
            return;
        }

        // If handlers are registered, we're in strict mode - throw if no handler found
        // This prevents silent failures when using the explicit registration pattern
        if (this.eventHandlers.size > 0) {
            throw new Error(`No handler registered for ${eventName}`);
        }

        // Fallback to legacy apply* method pattern for backwards compatibility
        // Only used when NO handlers are registered at all
        if ((this as any)[method]) {
            (this as any)[method](event);
        }
    }

    private methodToApplyEvent(eventName: string): string {

        return this.methodPrefix + eventName;
    }
}
