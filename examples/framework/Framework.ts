// ts-node examples/framework/Framework.ts
import "reflect-metadata";
import { PARAMETERS_ALIAS, SERVICES_ALIAS } from '../../src/Framework/Container/Bridge/Alias';
import CreateUserHandler from '../application/CreateUserHandler';
import EventStore from '../../src/EventSourcing/EventStore';
import User from '../domain/User';
import Kernel from '../../src/Framework/Kernel';
import CreateUser from '../application/CreateUser';
import DomainMessage from '../../src/Domain/Event/DomainMessage';
import ModuleContext from "../../src/Framework/Modules/ModuleContext";
import EventListener from "../../src/EventSourcing/EventBus/EventListener";

class EchoListener extends EventListener {
    public counter = 0
    public on(message: DomainMessage): void | Promise<void> {
        this.counter++
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

    const appModule = new ModuleContext({ services });

    const kernel = await Kernel.createFromModuleContext("dev", true, parameters, appModule);

    await kernel.handle(new CreateUser("1", "demo@example.org"));

    const recreatedUser = await kernel.container.get<EventStore<User>>("user.eventStore").load("1"); // Recreate User from events
    const listener = await kernel.container.get<EchoListener>("generic.subscriber");
    console.log('Listeners', listener.counter);

    console.log(recreatedUser); // Display the created user

    console.log(
        kernel.container.get("user.eventStore") // Conform overwrited default parameters (snapshotMargin 10 -> 40)
    );
})()
