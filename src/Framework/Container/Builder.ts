import { Container } from "inversify";
import { ParametersList } from "./Items/Parameter";
import { ServiceList } from "./Items/Service";
import parametersBinder from "./ParameterBinder";
import serviceBinder from "./ServiceBinder";

export default async function Builder(
    services: ServiceList,
    parameters: ParametersList,
): Promise<Container> {
    const container: Container = new Container();

    parametersBinder(container, parameters);
    await serviceBinder(container, services);

    return container;
}
