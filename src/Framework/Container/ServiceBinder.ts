import { Container } from "inversify";
import { ServiceList } from "./Items/Service";
import addModules from "./Services/AddModules";
import AttachListenersAndSubscribers from "./Services/AttachListenersAndSubscribers";

export default async function serviceBinder(container: Container, services: ServiceList): Promise<void> {
    const modules: any[] = [];
    addModules(services, modules);
    await container.loadAsync(...modules);
    AttachListenersAndSubscribers(services, container);
}
