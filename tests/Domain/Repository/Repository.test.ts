import "reflect-metadata";
import {EventBus, EventStore, InMemoryEventStore} from "../../../src/EventStore";
import {Dog} from "../AggregateRoot.test";
import Repository from '../../../src/Domain/Repository/Repository';

export class DogRepository extends Repository<Dog> {

}

describe("Repository", () => {
    it("Repository should store and retieve AggregateRoots", async () => {
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
        const repo = new DogRepository(store);
        const pluto = new Dog("demoId");

        pluto.sayWolf();

        repo.save(pluto);

        const another: Dog = await repo.load(pluto.getAggregateRootId());

        expect(another.getAggregateRootId()).toBe(pluto.getAggregateRootId());
        expect(another.wolfCount).toBe(pluto.wolfCount);
    });

    it("Repository should return null when no AggregateRoots", async () => {
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
        const repo = new DogRepository(store);

        expect(repo.load("aaaaa")).rejects.toMatchObject(new Error("Not found"));
    });
});
