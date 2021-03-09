"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DomainEventStream_1 = __importDefault(require("../Domain/Event/DomainEventStream"));
const AggregateRootNotFoundException_1 = __importDefault(require("./Exception/AggregateRootNotFoundException"));
class InMemoryEventStore {
    constructor() {
        this.events = {};
    }
    load(aggregateId, from = 0) {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];
            const stream = new DomainEventStream_1.default(events.slice(from));
            return Promise.resolve(stream);
        }
        throw new AggregateRootNotFoundException_1.default();
    }
    loadFromTo(aggregateId, from = 0, to) {
        if (this.events[aggregateId]) {
            const events = this.events[aggregateId];
            const stream = new DomainEventStream_1.default(events.slice(from, to));
            return Promise.resolve(stream);
        }
        throw new AggregateRootNotFoundException_1.default();
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