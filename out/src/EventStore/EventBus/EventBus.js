"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this.subscribersRegistry = {};
    }
    publish(message) {
        this.subscribersFor(message.event).forEach((subscriber) => subscriber.on(message.event));
    }
    attach(event, subscriber) {
        const eventName = event.name;
        const collection = this.subscribersRegistry[eventName] || [];
        collection.push(subscriber);
        this.subscribersRegistry[eventName] = collection;
        return this;
    }
    subscribersFor(event) {
        return this.subscribersRegistry[event.constructor.name] || [];
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map