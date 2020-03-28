import "reflect-metadata";
import { AggregateRootId, DomainEvent, EventSourced } from "../src/Domain";
import {
    EventBus,
    EventListener,
    EventStore,
    EventSubscriber,
    InMemoryEventStore,
    ISnapshotStoreDBAL,
    InMemorySnapshotStoreDBAL,
} from "../src/EventStore";
import { Dog, SayWolf } from './Domain/AggregateRoot.test';
import Scenario from "./Scenario"
import CommandBus from '../src/Application/Bus/Command/CommandBus';
import CommandHandlerResolver from '../src/Application/Bus/Command/CommandHandlerResolver';

describe("Scenario", () => {
    it("BDD Scenario", async () => {
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
            })
            .then([
                new SayWolf('1')
            ])
        ;
    });
});
