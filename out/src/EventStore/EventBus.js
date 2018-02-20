"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class EventBus {
    constructor() {
        this._subscribers = {};
    }
    publish(message) {
        this.subscribers(message.event).forEach((subscriber) => subscriber.on(message.event));
    }
    attach(event, subscriber) {
        let eventName = event.name;
        let collection = this._subscribers[eventName];
        if (!util_1.isArray(collection)) {
            collection = [];
        }
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