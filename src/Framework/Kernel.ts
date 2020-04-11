import { SERVICES_ALIAS } from './Container/Bridge/Alias';
import { ParametersList } from "./Container/Items/Parameter";
import { ServiceList } from "./Container/Items/Service";
import type { Container } from 'inversify';
import Builder from "./Container/Builder";
import type { ICommand, IQuery } from "../Application";
import type { QueryBusResponse } from '../Application/Bus/CallbackArg';
import type AppBridge from "./AppBridge";

export default class Kernel {

    public static async create(
        env: string = "dev",
        debug: boolean = false,
        services: ServiceList,
        parameters: ParametersList,
        testServices: ServiceList = new Map(),
        testParameters: ParametersList = new Map(),
    ): Promise<Kernel> {
        let container: Container;

        if (env === "test") {
            parameters = new Map([...parameters, ...testParameters]);
            services = new Map([...services, ...testServices]);
        }

        try {
            container = await Builder(services, parameters);
        } catch (error) {
            throw new Error("Container Compilation Error: " + error.message);
        }

        return new Kernel(debug, env, container);
    }

    private readonly app: AppBridge;

    private constructor(
        public readonly debug: boolean = false,
        public readonly env: string = "dev",
        public readonly container: Container,
    ) {
        this.app = this.container.get<AppBridge>(SERVICES_ALIAS.APP_BRIDGE);
    }

    public async ask(query: IQuery): Promise<QueryBusResponse> {
        return await this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.app.handle(command);
    }
}
