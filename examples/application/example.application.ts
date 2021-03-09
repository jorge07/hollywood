// ts-node examples/application/example.application.ts
import "reflect-metadata";
import User from "../domain/User";
import InMemorySnapshotStoreDBAL from '../../src/EventSourcing/Snapshot/InMemorySnapshotStoreDBAL';
import CreateUserHandler from './CreateUserHandler';
import CreateUser from './CreateUser';
import InMemoryEventStore from "../../src/EventSourcing/InMemoryEventStore";
import EventBus from "../../src/EventSourcing/EventBus/EventBus";
import EventStore from "../../src/EventSourcing/EventStore";

const eventStore = new EventStore<User>(
    User,
    new InMemoryEventStore(),
    new EventBus(),
    new InMemorySnapshotStoreDBAL(),
    10
);

export const handler = new CreateUserHandler(eventStore);

(async () => {
    await handler.handle(new CreateUser("1", "demo@example.org"));

    console.log(await eventStore.load("1"));
})()

