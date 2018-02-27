"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const Domain_1 = require("../Domain");
class InMemoryEventStore {
    constructor(eventBus) {
        this._events = [];
        this._eventBus = eventBus;
    }
    load(aggregateId) {
        if (this._events[aggregateId]) {
            const stream = new Domain_1.DomainEventStream();
            let events = this._events[aggregateId];
            events.forEach((event) => stream.events.push(Domain_1.DomainMessage.create(aggregateId, event)));
            return stream;
        }
        throw new _1.AggregateRootNotFoundException();
    }
    append(aggregateId, stream) {
        if (!this._events[aggregateId]) {
            this._events[aggregateId] = [];
        }
        stream.events.forEach((message) => {
            this._events[aggregateId].push(message.event);
            this._eventBus.publish(message);
        });
    }
}
exports.InMemoryEventStore = InMemoryEventStore;
//# sourceMappingURL=InMemoryEventStore.js.map