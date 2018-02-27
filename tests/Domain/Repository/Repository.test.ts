import {Repository} from "../../../src/Domain";
import {EventStore, InMemoryEventStore} from "../../../src/EventStore";
import {EventBus} from "../../../src/EventStore";
import {Dog} from "../AggregateRoot.test";

export class DogRepository implements Repository {

    constructor(private eventStore: EventStore) {}

    public save(aggregateRoot: Dog): void {
        this
            .eventStore
            .append(
                aggregateRoot.getAggregateRootId(),
                aggregateRoot.getUncommitedEvents(),
            );
    }

    public load(aggregateRootId: string): Dog {
        return (new Dog(aggregateRootId)).fromHistory(
            this.eventStore.load(aggregateRootId),
        );
    }
}

describe("Repository", () => {
    it("Repository should store and retieve AggregateRoots", () => {
        const repo = new DogRepository(new InMemoryEventStore(new EventBus()));
        const pluto = new Dog(Math.random().toString());

        pluto.sayWolf();

        repo.save(pluto);

        const another = repo.load(pluto.getAggregateRootId());

        expect(another.getAggregateRootId()).toBe(pluto.getAggregateRootId());
        expect(another.wolfCount).toBe(pluto.wolfCount);
    });
});
