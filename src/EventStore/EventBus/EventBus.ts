import {EventSubscriber} from "../EventBus/EventSubscriber";
import {DomainEvent} from "../../Domain/Event/DomainEvent";
import {DomainMessage} from "../../Domain/Event/DomainMessage";
import {isArray} from "util";

interface SubscriberRegistry {
    [key: string]: Array<EventSubscriber>
}

export class EventBus {

    private _subscribers: SubscriberRegistry = {};

    publish(message: DomainMessage) {
        this.subscribers(message.event).forEach((subscriber) => subscriber.on(message.event))
    }
    
    attach(event: any, subscriber: EventSubscriber) {
        const eventName = (<any> event).name;
        const collection = this._subscribers[eventName] || [];
        
        collection.push(subscriber);

        this._subscribers[eventName] = collection;

        return this
    }

    private subscribers(event: DomainEvent): Array<EventSubscriber> {
        return this._subscribers[(<any> event).constructor.name] || [];
    }
}