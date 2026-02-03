import "reflect-metadata";
import {Dog} from "../AggregateRoot.test";
import Repository from '../../../src/EventSourcing/Repository/Repository';
import InMemoryEventStore from "../../../src/EventSourcing/InMemoryEventStore";
import EventBus from "../../../src/EventSourcing/EventBus/EventBus";
import EventStore from "../../../src/EventSourcing/EventStore";
import { Identity } from "../../../src/Domain/AggregateRoot";

export class DogRepository extends Repository<Dog> {

}

describe("Repository", () => {
    it("Repository should store and retieve AggregateRoots", async () => {
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
        const repo = new DogRepository(store);
        const pluto = new Dog(Identity.fromString('550e8400-e29b-41d4-a716-446655440000'));

        pluto.sayWolf();

        repo.save(pluto);

        const another: Dog = await repo.load(pluto.getAggregateRootId());

        expect(another.getAggregateRootId().equals(pluto.getAggregateRootId())).toBe(true);
        expect(another.wolfCount).toBe(pluto.wolfCount);
    });

    it("Repository should return null when no AggregateRoots", async () => {
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
        const repo = new DogRepository(store);

        expect(repo.load(Identity.fromString('550e8400-e29b-41d4-a716-446655440000'))).rejects.toMatchObject(new Error("Not found"));
    });
});
