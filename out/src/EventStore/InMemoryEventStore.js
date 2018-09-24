"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const Domain_1 = require("../Domain");
class InMemoryEventStore {
    constructor() {
        this.events = [];
    }
    load(aggregateId, from = 0) {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];
            const stream = new Domain_1.DomainEventStream(events
                .slice(from));
            return Promise.resolve(stream);
        }
        throw new _1.AggregateRootNotFoundException();
    }
    loadFromTo(aggregateId, from = 0, to) {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];
            const stream = new Domain_1.DomainEventStream(events
                .slice(from, to));
            return Promise.resolve(stream);
        }
        throw new _1.AggregateRootNotFoundException();
    }
    append(aggregateId, stream) {
        if (!this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }
        stream.events.forEach((message) => {
            this.events[aggregateId].push(message);
        });
    }
}
exports.default = InMemoryEventStore;
//# sourceMappingURL=InMemoryEventStore.js.map