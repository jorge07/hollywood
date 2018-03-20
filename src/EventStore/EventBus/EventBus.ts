import {isArray} from "util";
import DomainEvent from "../../Domain/Event/DomainEvent";
import DomainMessage from "../../Domain/Event/DomainMessage";
import EventSubscriber from "./EventSubscriber";

type SubscriberRegistry = {
    [key: string]: EventSubscriber[];
}

export default class EventBus {

    private readonly subscribersRegistry: SubscriberRegistry = <SubscriberRegistry>{};

    public publish(message: DomainMessage) {
        this.subscribersFor(message.event).forEach((subscriber) => subscriber.on(message.event));
    }

    public attach(event: any, subscriber: EventSubscriber) {
        const eventName = (event as any).name;
        const collection = this.subscribersRegistry[eventName] || [];

        collection.push(subscriber);

        this.subscribersRegistry[eventName] = collection;

        return this;
    }

    private subscribersFor(event: DomainEvent): EventSubscriber[] {
        return this.subscribersRegistry[(event as any).constructor.name] || [];
    }
}
