import { Container, interfaces } from 'inversify';
import { IAppResponse, ICommand, IQuery } from "../Application";
import AppBridge from "./AppBridge";
import Builder from "./Container/Builder";
import { ParametersList } from "./Container/Items/Parameter";
import { ServiceList } from "./Container/Items/Service";
import { LIST } from './Container/Bridge/Services';
import { QueryBusResponse } from '../Application/Bus/CallbackArg';
import { PARAMETERS } from './Container/Bridge/Parameters';
import { SERVICES_ALIAS } from './Container/Bridge/Alias';

export default class Kernel {

    public static async create(
        env: string = "dev",
        debug: boolean = false,
        services: ServiceList,
        parameters: ParametersList,
        testServices: ServiceList = new Map(),
        testParameters: ParametersList = new Map(),
    ): Promise<Kernel> {
        let servicesMap: ServiceList = new Map([...LIST, ...services]);
        let parametersMap: ParametersList = new Map([...PARAMETERS, ...parameters]);
        let container: Container;

        if (env === "test") {
            parametersMap = new Map([...parameters, ...testParameters]);
            servicesMap = new Map([...servicesMap, ...testServices]);
        }

        try {
            container = await Builder(servicesMap, parametersMap);
        } catch (error) {
            throw new Error("Container Compilation Error: " + error.message);
        }

        return new Kernel(debug, env, container);
    }

    private readonly app: AppBridge;

    private constructor(
        public readonly debug: boolean = false,
        public readonly env: string = "dev",
        private readonly container: Container,
    ) {
        this.app = this.container.get<AppBridge>(SERVICES_ALIAS.APP_BRIDGE);
    }

    public async ask(query: IQuery): Promise<QueryBusResponse> {
        return await this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.app.handle(command);
    }

    public get<T>(identifier: interfaces.ServiceIdentifier<T>): T {
        return this.container.get<T>(identifier);
    }

    public resolve<T>(identifier: interfaces.Newable<T>): T {
        return this.container.resolve<T>(identifier);
    }
}
