"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class EventBus {
    constructor() {
        this.subscribersRegistry = {};
        this.listenersRegistry = {};
    }
    publish(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscribers = this.subscribersFor(message.event);
            for (const key in subscribers) {
                if (subscribers.hasOwnProperty(key)) {
                    yield subscribers[key].on(message);
                }
            }
            const listeners = Object.keys(this.listenersRegistry);
            for (const key in listeners) {
                if (listeners.hasOwnProperty(key)) {
                    yield this.listenersRegistry[listeners[key]].on(message);
                }
            }
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