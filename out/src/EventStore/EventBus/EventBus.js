"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this.subscribersRegistry = {};
        this.listenersRegistry = {};
    }
    publish(message) {
        this.subscribersFor(message.event).forEach((subscriber) => subscriber.on(message));
        Object.keys(this.listenersRegistry).forEach((key) => {
            this.listenersRegistry[key].on(message);
        });
    }
    attach(event, subscriber) {
        const eventName = event.name;
        const collection = this.subscribersRegistry[eventName] || [];
        collection.push(subscriber);
        this.subscribersRegistry[eventName] = collection;
        return this;
    }
    addListener(listener) {
        if (!this.listenersRegistry[listener.constructor.name]) {
            this.listenersRegistry[listener.constructor.name] = listener;
        }
        return this;
    }
    subscribersFor(event) {
        return this.subscribersRegistry[event.constructor.name] || [];
    }
}
exports.default = EventBus;
//# sourceMappingURL=EventBus.js.map