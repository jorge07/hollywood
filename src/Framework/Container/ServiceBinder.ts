import { AsyncContainerModule, Container } from "inversify";
import { ServiceList } from "./Items/Service";
import addModules from "./Services/AddModules";
import attachListenersAndSubscribers from "./services/AttachListenerAndSubscribers";

export default async function serviceBinder(container: Container, services: ServiceList): Promise<void> {
    const modules: any[] = [];
    addModules(services, modules);
    await container.loadAsync(...modules);
    attachListenersAndSubscribers(services, container);
}
