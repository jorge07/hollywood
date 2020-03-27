import { Container } from "inversify";
import { IAppError, IAppResponse, ICommand, IQuery } from "../Application";
import AppBridge from "./AppBridge";
import { bridgeServices } from "./Bridge/services";
import Builder from "./Container/Builder";
import { ParametersList } from "./Container/Items/Parameter";
import { ServiceList } from "./Container/Items/Service";

export default class Kernel {

    public static async create(
        env: string = "dev",
        debug: boolean = false,
        services: ServiceList,
        parameters: ParametersList,
        testServices: ServiceList = new Map(),
        testParameters: ParametersList = new Map(),
    ): Promise<Kernel> {
        let servicesMap: ServiceList = new Map([...bridgeServices, ...services]);
        let parametersMap: ParametersList = parameters;
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
        this.app = this.container.get<AppBridge>("app");
    }

    public async ask(query: IQuery): Promise<IAppResponse|IAppError|null> {
        return await this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.app.handle(command);
    }

    public get(identifier: string): any {
        return this.container.get(identifier);
    }
}
