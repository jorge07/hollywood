"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventSubscriber {
    on(event) {
        if (this["on" + event.constructor.name]) {
            this["on" + event.constructor.name](event);
        }
    }
}
exports.default = EventSubscriber;
//# sourceMappingURL=EventSubscriber.js.map