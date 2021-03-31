import type DomainMessage from "../../Domain/Event/DomainMessage";
import type EventListener from "./EventListener";
import type EventSubscriber from "./EventSubscriber";
export default class EventBus {
    private readonly subscribersRegistry;
    private readonly listenersRegistry;
    publish(message: DomainMessage): Promise<void>;
    attach(event: any, subscriber: EventSubscriber): EventBus;
    addListener(listener: EventListener): EventBus;
    private subscribersFor;
}
