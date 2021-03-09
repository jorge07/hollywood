import type { ParametersList } from "./Container/Items/Parameter";
import type { Container } from 'inversify';
import type { QueryBusResponse } from '../Application/Bus/CallbackArg';
import type ModuleContext from "./Modules/ModuleContext";
import type IQuery from "../Application/Bus/Query/Query";
import type ICommand from "../Application/Bus/Command/Command";
import AppBuilder from "./AppBuilder";
import { BuildFromModuleContext } from "./Container/Builder";

export default class Kernel {

    public static async createFromModuleContext(
        env: string = "dev",
        debug: boolean = false,
        parameters: ParametersList,
        moduleContext: ModuleContext,
        testParameters: ParametersList = new Map()
    ): Promise<Kernel> {
        parameters = Kernel.overwriteParamsOnTest(env, parameters, testParameters)
        const container = await BuildFromModuleContext(parameters, moduleContext);
        return new Kernel(debug, env, container);
    }

    private readonly app: AppBuilder;

    private constructor(
        public readonly debug: boolean = false,
        public readonly env: string = "dev",
        public readonly container: Container,
    ) {
        this.app = new AppBuilder(this.container);
    }

    private static overwriteParamsOnTest(env: string, parameters: ParametersList, testParameters: ParametersList,): ParametersList {
        if (env === "test") {
            return new Map([...parameters, ...testParameters]);
        }
        return parameters;
    }

    public async ask(query: IQuery): Promise<QueryBusResponse> {
        return this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.app.handle(command);
    }
}
