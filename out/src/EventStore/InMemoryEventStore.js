"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainEventStream_1 = require("../Domain/Event/DomainEventStream");
const AggregateRootNotFoundException_1 = require("./Exception/AggregateRootNotFoundException");
const DomainMessage_1 = require("../Domain/Event/DomainMessage");
class InMemoryEventStore {
    constructor(eventBus) {
        this._events = [];
        this._eventBus = eventBus;
    }
    load(aggregateId) {
        if (this._events[aggregateId]) {
            const stream = new DomainEventStream_1.DomainEventStream();
            let events = this._events[aggregateId];
            events.forEach((event) => stream.events.push(DomainMessage_1.DomainMessage.create(aggregateId, event)));
            return stream;
        }
        throw new AggregateRootNotFoundException_1.AggregateRootNotFoundException();
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