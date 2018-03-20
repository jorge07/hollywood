"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventStore_1 = require("../../../src/EventStore");
const EventStore_2 = require("../../../src/EventStore");
const AggregateRoot_test_1 = require("../AggregateRoot.test");
class DogRepository {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    save(eventSourced) {
        this
            .eventStore
            .append(eventSourced.getAggregateRootId(), eventSourced.getUncommitedEvents());
    }
    load(aggregateRootId) {
        return (new AggregateRoot_test_1.Dog(aggregateRootId)).fromHistory(this.eventStore.load(aggregateRootId));
    }
}
exports.DogRepository = DogRepository;
describe("Repository", () => {
    it("Repository should store and retieve AggregateRoots", () => {
        const repo = new DogRepository(new EventStore_1.InMemoryEventStore(new EventStore_2.EventBus()));
        const pluto = new AggregateRoot_test_1.Dog(Math.random().toString());
        pluto.sayWolf();
        repo.save(pluto);
        const another = repo.load(pluto.getAggregateRootId());
        expect(another.getAggregateRootId()).toBe(pluto.getAggregateRootId());
        expect(another.wolfCount).toBe(pluto.wolfCount);
    });
});
//# sourceMappingURL=Repository.test.js.map