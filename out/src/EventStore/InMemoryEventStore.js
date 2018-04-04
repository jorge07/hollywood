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
            const stream = new Domain_1.DomainEventStream();
            const events = this.events[aggregateId];
            events
                .slice(from)
                .forEach((event) => stream.events.push(Domain_1.DomainMessage.create(aggregateId, event)));
            return new Promise((resolve, rejesct) => resolve(stream));
        }
        throw new _1.AggregateRootNotFoundException();
    }
    append(aggregateId, stream) {
        if (!this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }
        stream.events.forEach((message) => {
            this.events[aggregateId].push(message.event);
        });
    }
}
exports.default = InMemoryEventStore;
//# sourceMappingURL=InMemoryEventStore.js.map