// ts-node examples/framework/Framework.ts 
import "reflect-metadata";
import { PARAMETERS_ALIAS, SERVICES_ALIAS } from '../../src/Framework/Container/Bridge/Alias';
import CreateUserHandler from '../application/CreateUserHandler';
import EventStore from '../../src/EventStore/EventStore';
import User from '../domain/User';
import Kernel from '../../src/Framework/Kernel';
import CreateUser from '../application/CreateUser';
import { EventListener } from "../../src/EventStore";
import DomainMessage from '../../src/Domain/Event/DomainMessage';

class EchoListener extends EventListener {
    public on(message: DomainMessage): void | Promise<void> {
        console.log(`The following event with id ${message.uuid} was Stored in Memory`, message.event); // Confirm that event was received
    }
}

const parameters = new Map([
    [PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN, "40"] // You can overwrite default parameters
]);

const services = new Map([
    [SERVICES_ALIAS.COMMAND_HANDLERS, {
        collection: [
            CreateUserHandler
        ]
    }],
    ["user.eventStore", {
        eventStore: User
    }],
    ["generic.subscriber", {
        instance: EchoListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true
    }],
]);

(async () => {

    const kernel = await Kernel.create("dev", true, services, parameters);

    await kernel.handle(new CreateUser("1", "demo@example.org"));

    const recreatedUser = await kernel.container.get<EventStore<User>>("user.eventStore").load("1"); // Recreate User from events

    console.log(recreatedUser); // Display the created user

    console.log(
        kernel.container.get("user.eventStore") // Conform overwrited default parameters (snapshotMargin 10 -> 40)
    );
})()
