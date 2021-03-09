// ts-node examples/application/example.application.ts
import "reflect-metadata";
import User from "../domain/User";
import InMemorySnapshotStoreDBAL from '../../src/EventStore/Snapshot/InMemorySnapshotStoreDBAL';
import CreateUserHandler from './CreateUserHandler';
import CreateUser from './CreateUser';
import InMemoryEventStore from "../../src/EventStore/InMemoryEventStore";
import EventBus from "../../src/EventStore/EventBus/EventBus";
import EventStore from "../../src/EventStore/EventStore";

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

