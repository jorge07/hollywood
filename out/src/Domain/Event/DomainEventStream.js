"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DomainEventStream {
    constructor(events = [], name = "master") {
        this.events = events;
        this.name = name;
    }
    isEmpty() {
        return 0 === this.events.length;
    }
}
exports.default = DomainEventStream;
//# sourceMappingURL=DomainEventStream.js.map