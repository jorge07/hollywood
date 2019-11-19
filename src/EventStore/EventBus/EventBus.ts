import { addListener } from "cluster";
import {isArray} from "util";
import DomainEvent from "../../Domain/Event/DomainEvent";
import DomainMessage from "../../Domain/Event/DomainMessage";
import EventListener from "./EventListener";
import EventSubscriber from "./EventSubscriber";

interface ISubscriberRegistry {
    [key: string]: EventSubscriber[];
}

interface IListenersRegistry {
    [key: string]: EventListener;
}

export default class EventBus {

    private readonly subscribersRegistry: ISubscriberRegistry = {};
    private readonly listenersRegistry: IListenersRegistry = {};

    public async publish(message: DomainMessage): Promise<void> {
        const subscribers = this.subscribersFor(message.eventType);
        for (const key in subscribers) {
            if (subscribers.hasOwnProperty(key)) {
                await subscribers[key].on(message);
            }
        }

        const listeners = Object.keys(this.listenersRegistry);
        for (const key in listeners) {
            if (listeners.hasOwnProperty(key)) {
                await this.listenersRegistry[listeners[key]].on(message);
            }
        }
    }

    public attach(event: any, subscriber: EventSubscriber): EventBus {
        const eventName = event.name;
        const collection = this.subscribersRegistry[eventName] || [];

        collection.push(subscriber);

        this.subscribersRegistry[eventName] = collection;

        return this;
    }

    public addListener(listener: EventListener): EventBus {
        if (! this.listenersRegistry[listener.constructor.name]) {
            this.listenersRegistry[listener.constructor.name] = listener;
        }

        return this;
    }

    private subscribersFor(eventType: string): EventSubscriber[] {
        return this.subscribersRegistry[eventType] || [];
    }
}
