import { AggregateRootId, DomainEvent, EventSourced } from "../../../src/Domain";
import {
    EventBus,
    EventListener,
    EventStore,
    EventSubscriber,
    InMemoryEventStore,
    ISnapshotStoreDBAL,
} from "../../../src/EventStore";
import { Dog, SayWolf } from "../../Domain/AggregateRoot.test";

interface ISnapshotDictionary {
    [x: string]: any;
}

class InMemorySnapshotStore implements ISnapshotStoreDBAL<Dog> {

    public snapshots: ISnapshotDictionary = {};

    public async get(uuid: AggregateRootId): Promise<Dog|null> {
        return this.snapshots[uuid] || null;

    }

    public async store(entity: Dog): Promise<void> {
        this.snapshots[entity.getAggregateRootId()] = entity;
    }
}

describe("SnapshotStore", () => {
    it("EventStore should store, publish and retrieve events", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStore();

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

        expect(pluto.version()).toBe(10);

        store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(snapshotDBAL.snapshots[pluto.getAggregateRootId()]).toBe(pluto);
    });
});
