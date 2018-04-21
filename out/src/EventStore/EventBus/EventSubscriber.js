"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventSubscriber {
    on(message) {
        if (this["on" + message.eventType]) {
            this["on" + message.eventType](message.event);
        }
    }
}
exports.default = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map