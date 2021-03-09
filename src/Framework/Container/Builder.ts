import { Container } from "inversify";
import type { ParametersList } from "./Items/Parameter";
import parametersBinder from "./ParameterBinder";
import { PARAMETERS } from './Bridge/Parameters';
import type ModuleContext from "../Modules/ModuleContext";
import ContainerCompilationException from "./Exception/ContainerCompilationException";
import {HollywoodModule} from "../HollywoodModule";
import {BindListeners} from "./Items/Services/Type/ListenerType";

export async function BuildFromModuleContext(
    parameters: ParametersList,
    moduleContext: ModuleContext
): Promise<Container> {
    try {
        const container: Container = new Container();
        parametersBinder(container, new Map([...PARAMETERS, ...parameters]));
        await HollywoodModule().load(container);
        await moduleContext.load(container);
        // Initialize listeners
        BindListeners(container);
        return container;
    } catch (error) {
        throw new ContainerCompilationException(error.message);
    }
}
