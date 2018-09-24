import { EventBus, EventStore, InMemoryEventStore } from "../../../src/EventStore";
import { Dog } from "../AggregateRoot.test";
import Repository from '../../../src/Domain/Repository/Repository';

export class DogRepository extends Repository<Dog> {

}

describe("Repository", () => {
    it("Repository should store and retieve AggregateRoots", async () => {
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
        const repo = new DogRepository(store);
        const pluto = new Dog();

        pluto.sayWolf();

        repo.save(pluto);

        const another: Dog = await repo.load(pluto.getAggregateRootId());

        expect(another.getAggregateRootId()).toBe(pluto.getAggregateRootId());
        expect(another.wolfCount).toBe(pluto.wolfCount);
    });
});
