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

    public publish(message: DomainMessage): void {
        this.subscribersFor(message.event).forEach((subscriber: EventSubscriber) => subscriber.on(message));
        Object.keys(this.listenersRegistry).forEach((key) => {
           this.listenersRegistry[key].on(message);
        });
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

    private subscribersFor(event: DomainEvent): EventSubscriber[] {
        return this.subscribersRegistry[event.constructor.name] || [];
    }
}
