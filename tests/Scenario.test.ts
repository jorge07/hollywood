import "reflect-metadata";
import {Dog, SayWolf} from './Domain/AggregateRoot.test';
import Scenario from "./Scenario"
import EventBus from "../src/EventSourcing/EventBus/EventBus";
import InMemorySnapshotStoreDBAL from "../src/EventSourcing/Snapshot/InMemorySnapshotStoreDBAL";
import InMemoryEventStore from "../src/EventSourcing/InMemoryEventStore";
import EventStore from "../src/EventSourcing/EventStore";

describe("Scenario", () => {
    it("BDD Scenario for an action", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);

        const scenario = new Scenario<Dog>(Dog, store);

        scenario
            .withAggregateId('1')
            .when(() => {
                const dog = new Dog('1');
                dog.sayWolf()

                return dog;
            });
        scenario
            .then([
                new SayWolf('1')
            ])
        ;
    });

    it("BDD Scenario for an state", async () => {
        const eventBus = new EventBus();
        const snapshotDBAL = new InMemorySnapshotStoreDBAL();

        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus, snapshotDBAL);

        const scenario = new Scenario<Dog>(Dog, store);

        await scenario
            .withAggregateId('1')
            .given([
                new SayWolf('1')
            ]);
        scenario.when((dog?: Dog) => {
            if (!dog) {
                throw new Error('expected aggregateRoot dog')
            }

            expect(dog.version()).toBe(0);
            return dog;
        });
    });
});
