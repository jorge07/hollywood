"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const Domain_1 = require("../Domain");
class InMemoryEventStore {
    constructor(eventBus) {
        this.events = [];
        this.eventBus = eventBus;
    }
    load(aggregateId) {
        if (this.events[aggregateId]) {
            const stream = new Domain_1.DomainEventStream();
            const events = this.events[aggregateId];
            events.forEach((event) => stream.events.push(Domain_1.DomainMessage.create(aggregateId, event)));
            return stream;
        }
        throw new _1.AggregateRootNotFoundException();
    }
    append(aggregateId, stream) {
        if (!this.events[aggregateId]) {
            this.events[aggregateId] = [];
        }
        stream.events.forEach((message) => {
            this.events[aggregateId].push(message.event);
            this.eventBus.publish(message);
        });
    }
}
exports.InMemoryEventStore = InMemoryEventStore;
//# sourceMappingURL=InMemoryEventStore.js.map