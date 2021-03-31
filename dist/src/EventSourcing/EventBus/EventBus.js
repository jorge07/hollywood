"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this.subscribersRegistry = {};
        this.listenersRegistry = {};
    }
    async publish(message) {
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
    subscribersFor(eventType) {
        return this.subscribersRegistry[eventType] || [];
    }
}
exports.default = EventBus;
//# sourceMappingURL=EventBus.js.map