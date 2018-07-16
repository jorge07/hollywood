import { AggregateRootId, DomainEvent, EventSourced } from "../../../src/Domain";
import {
    EventBus,
    EventListener,
    EventStore,
    EventSubscriber,
    InMemoryEventStore,
    ISnapshotStoreDBAL,
    InMemorySnapshotStoreDBAL,
} from "../../../src/EventStore";
import { Dog, SayWolf } from "../../Domain/AggregateRoot.test";


describe("SnapshotStore", () => {
    it("EventStore should store, publish and retrieve events", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);
        const pluto = new Dog();

        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();
        pluto.sayWolf();

        expect(pluto.records().length).toBe(11);

        expect(pluto.version()).toBe(10);

        await store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());

        expect(dog.records().length).toBe(pluto.records().length);
    });
});
