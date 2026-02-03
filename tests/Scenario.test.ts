import "reflect-metadata";
import {Dog, SayWolf} from './Domain/AggregateRoot.test';
import {Scenario, createTestEventStore} from "../src/Testing";
import { Identity } from "../src/Domain/AggregateRoot";

describe("Scenario", () => {
    it("BDD Scenario for an action", async () => {
        const store = createTestEventStore(Dog, { withSnapshots: true });

        const scenario = new Scenario<Dog>(Dog, store);
        const dogId = Identity.fromString('00000000-0000-4000-8000-000000000001');

        scenario
            .withAggregateId(dogId)
            .when(() => {
                const dog = new Dog(dogId);
                dog.sayWolf()

                return dog;
            });
        scenario
            .then([
                new SayWolf(dogId.toString())
            ])
        ;
    });

    it("BDD Scenario for an state", async () => {
        const store = createTestEventStore(Dog, { withSnapshots: true });

        const scenario = new Scenario<Dog>(Dog, store);
        const dogId = Identity.fromString('00000000-0000-4000-8000-000000000001');

        await scenario
            .withAggregateId(dogId)
            .given([
                new SayWolf(dogId.toString())
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
