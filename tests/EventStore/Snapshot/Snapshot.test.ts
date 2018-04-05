import { EventBus, EventSubscriber, InMemoryEventStore, EventListener, EventStore, ISnapshotStoreDBAL } from "../../../src/EventStore";
import { AggregateRootId, EventSourced, DomainEvent } from '../../../src/Domain';
import { Dog, SayWolf } from "../../Domain/AggregateRoot.test";

type SnapshotDictionary = {
    [x: string]: any
}

class InMemorySnapshotStore<T extends EventSourced> implements ISnapshotStoreDBAL<T> {

    public snapshots: SnapshotDictionary = {}

    async get(uuid: AggregateRootId): Promise<T|null>{
        return this.snapshots[uuid] || null;
        
    }

    async store(entity: T): Promise<void> {
        this.snapshots[entity.getAggregateRootId()] = entity;
    }
}

describe("SnapshotStore", () => {
    it("EventStore should store, publish and retrieve events", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStore<Dog>();

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

        expect(pluto.version()).toBe(10)

        store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(snapshotDBAL.snapshots[pluto.getAggregateRootId()]).toBe(pluto);
    });
});
