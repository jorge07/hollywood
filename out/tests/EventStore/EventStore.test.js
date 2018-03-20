"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventStore_1 = require("../../src/EventStore");
const AggregateRoot_test_1 = require("../Domain/AggregateRoot.test");
class OnWolfEventSubscriber extends EventStore_1.EventSubscriber {
    onSayWolf(event) {
        this.wolf = event;
    }
}
describe("EventStore", () => {
    it("EventStore should store, publish and retrieve events", () => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber();
        const eventBus = new EventStore_1.EventBus();
        eventBus.attach(AggregateRoot_test_1.SayWolf, onWolfEventSubscriber);
        const store = new EventStore_1.InMemoryEventStore(eventBus);
        const pluto = new AggregateRoot_test_1.Dog(Math.random().toString());
        pluto.sayWolf();
        store.append(pluto.getAggregateRootId(), pluto.getUncommitedEvents());
        const events = store.load(pluto.getAggregateRootId());
        const fromHistory = (new AggregateRoot_test_1.Dog(pluto.getAggregateRootId())).fromHistory(events);
        expect(fromHistory.wolfCount).toBe(1);
        expect(fromHistory.playhead).toBe(0);
        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(AggregateRoot_test_1.SayWolf);
    });
});
//# sourceMappingURL=EventStore.test.js.map