import "reflect-metadata";

import {Dog} from "../../Domain/AggregateRoot.test";
import InMemorySnapshotStoreDBAL from "../../../src/EventSourcing/Snapshot/InMemorySnapshotStoreDBAL";
import EventBus from "../../../src/EventSourcing/EventBus/EventBus";
import InMemoryEventStore from "../../../src/EventSourcing/InMemoryEventStore";
import EventStore from "../../../src/EventSourcing/EventStore";
import { Identity } from "../../../src/Domain/AggregateRoot";

describe("SnapshotStore", () => {
    it("EventSourcing should store, publish and retrieve events when snapshot is found", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();
        const inMemoryEventStore = new InMemoryEventStore();

        const store = new EventStore<Dog>(Dog, inMemoryEventStore, eventBus, snapshotDBAL);
        const pluto = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));

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


    it("EventSourcing should store, publish and retrieve events when no snapshot is found", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);
        const pluto = new Dog(Identity.fromString('00000000-0000-4000-8000-000000000031'));

        pluto.sayWolf();
        pluto.sayWolf();

        expect(pluto.records().length).toBe(2);

        expect(pluto.version()).toBe(1);

        await store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());

        expect(dog.records().length).toBe(pluto.records().length);
    });
});
