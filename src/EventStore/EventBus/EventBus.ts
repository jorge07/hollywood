import { addListener } from 'cluster';
import {isArray} from "util";
import DomainEvent from "../../Domain/Event/DomainEvent";
import DomainMessage from "../../Domain/Event/DomainMessage";
import EventSubscriber from './EventSubscriber';
import EventListener from "./EventListener";

type SubscriberRegistry = {
    [key: string]: EventSubscriber[];
}

type ListenersRegistry = {
    [key: string]: EventListener;
}

export default class EventBus {

    private readonly subscribersRegistry: SubscriberRegistry = <SubscriberRegistry>{};
    private readonly listenersRegistry: ListenersRegistry = <ListenersRegistry>{};

    publish(message: DomainMessage): void {
        this.subscribersFor(message.event).forEach((subscriber: EventSubscriber) => subscriber.on(message.event));
        Object.keys(this.listenersRegistry).forEach( key => {
           this.listenersRegistry[key].on(message.event)
        });
    }

    attach(event: any, subscriber: EventSubscriber): EventBus {
        const eventName = (event as any).name;
        const collection = this.subscribersRegistry[eventName] || [];

        collection.push(subscriber);

        this.subscribersRegistry[eventName] = collection;

        return this;
    }

    addListener(listener: EventListener): EventBus {
        if (! this.listenersRegistry[(listener as any).name]) {
            this.listenersRegistry[(listener as any).name] = listener;
        }

        return this;
    }

    private subscribersFor(event: DomainEvent): EventSubscriber[] {
        return this.subscribersRegistry[(event as any).constructor.name] || [];
    }
}
