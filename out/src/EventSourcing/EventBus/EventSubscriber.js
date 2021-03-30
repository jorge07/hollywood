"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventSubscriber {
    async on(message) {
        const method = "on" + message.eventType;
        if (this[method]) {
            await this[method](message.event);
        }
    }
}
exports.default = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map