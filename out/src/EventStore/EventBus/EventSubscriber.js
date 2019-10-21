"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventSubscriber {
    on(message) {
        const method = "on" + message.eventType;
        if (this[method]) {
            this[method](message.event);
        }
    }
}
exports.default = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map