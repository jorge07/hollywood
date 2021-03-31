"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventSourced {
    constructor() {
        this.children = [];
    }
    fromSnapshot(snapshot) {
        Object.assign(this, snapshot);
        return this;
    }
    recursiveHandling(event, method) {
        this.handle(event, method);
        this.getChildEntities().forEach((aggregate) => {
            aggregate.recursiveHandling(event, method);
        });
    }
    getChildEntities() {
        return this.children;
    }
    registerChildren(child) {
        this.children.push(child);
    }
    handle(event, method) {
        if (this[method]) {
            this[method](event);
        }
    }
}
exports.default = EventSourced;
//# sourceMappingURL=EventSourced.js.map