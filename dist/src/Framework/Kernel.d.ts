import type { ParametersList } from "./Container/Items/Parameter";
import type { Container } from 'inversify';
import type ModuleContext from "./Modules/ModuleContext";
import type { App } from "../Application";
export default class Kernel {
    readonly env: string;
    readonly container: Container;
    static createFromModuleContext(env: string, parameters: ParametersList, moduleContext: ModuleContext, testParameters?: ParametersList): Promise<Kernel>;
    readonly app: App;
    private constructor();
    private static overwriteParamsOnTest;
}
