import type { ParametersList } from "./Container/Items/Parameter";
import type { Container } from 'inversify';
import type ModuleContext from "./Modules/ModuleContext";
import AppBuilder from "./AppBuilder";
import { BuildFromModuleContext } from "./Container/Builder";
import type { App } from "../Application";

export default class Kernel {
    public static async createFromModuleContext(
        env: string,
        parameters: ParametersList,
        moduleContext: ModuleContext,
        testParameters: ParametersList = new Map()
    ): Promise<Kernel> {
        parameters = Kernel.overwriteParamsOnTest(env, parameters, testParameters)
        const container = await BuildFromModuleContext(parameters, moduleContext);
        return new Kernel(env, container);
    }

    public readonly app: App;

    private constructor(
        public readonly env: string,
        public readonly container: Container,
    ) {
        this.app = AppBuilder(this.container);
    }

    private static overwriteParamsOnTest(env: string, parameters: ParametersList, testParameters: ParametersList,): ParametersList {
        if (env === "test") {
            return new Map([...parameters, ...testParameters]);
        }
        return parameters;
    }
}
