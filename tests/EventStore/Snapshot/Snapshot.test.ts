import "reflect-metadata";
import {
    EventBus,
    EventStore,
    InMemoryEventStore,
    InMemorySnapshotStoreDBAL,
} from "../../../src/EventStore";
import {Dog} from "../../Domain/AggregateRoot.test";

describe("SnapshotStore", () => {
    it("EventStore should store, publish and retrieve events when snapshot is found", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);
        const pluto = new Dog("31");

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


    it("EventStore should store, publish and retrieve events when no snapshot is found", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);
        const pluto = new Dog("31");

        pluto.sayWolf();
        pluto.sayWolf();

        expect(pluto.records().length).toBe(2);

        expect(pluto.version()).toBe(1);

        await store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());

        expect(dog.records().length).toBe(pluto.records().length);
    });
});
