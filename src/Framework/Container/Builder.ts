import { Container } from "inversify";
import { ParametersList } from "./Items/Parameter";
import { ServiceList } from "./Items/Service";
import parametersBinder from "./ParameterBinder";
import serviceBinder from "./ServiceBinder";
import { PARAMETERS } from './Bridge/Parameters';
import { LIST } from './Bridge/Services';

export default async function Builder(
    services: ServiceList,
    parameters: ParametersList,
): Promise<Container> {
    const container: Container = new Container();

    parametersBinder(container, new Map([...PARAMETERS, ...parameters]));
    await serviceBinder(container, new Map([...LIST, ...services]));

    return container;
}
