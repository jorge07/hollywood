"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this._subscribers = {};
    }
    publish(message) {
        this.subscribers(message.event).forEach((subscriber) => subscriber.on(message.event));
    }
    attach(event, subscriber) {
        const eventName = event.name;
        const collection = this._subscribers[eventName] || [];
        collection.push(subscriber);
        this._subscribers[eventName] = collection;
        return this;
    }
    subscribers(event) {
        return this._subscribers[event.constructor.name] || [];
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map