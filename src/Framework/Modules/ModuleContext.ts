import type {IService, ServiceList} from "../Container/Items/Service";
import type { interfaces } from "inversify";
import type ICommandHandler from "../../Application/Bus/Command/CommandHandler";
import type IQueryHandler from "../../Application/Bus/Query/QueryHandler";
import { createContainerModule } from "../Container/Items/Services/AddModules";
import {SERVICES_ALIAS} from "../Container/Bridge/Alias";

export interface ModuleConfig {
    commands?: any[]
    queries?: any[]
    services: ServiceList
    modules?: ModuleContext[]
}

export default class ModuleContext {
    public readonly modules: ModuleContext[]
    public readonly config: ModuleConfig

    constructor(config: ModuleConfig) {
        if (config.commands) {
            config.services.set(SERVICES_ALIAS.COMMAND_HANDLERS, ModuleContext.bindCommands(config.commands));
        }
        if (config.queries) {
            config.services.set(SERVICES_ALIAS.QUERY_HANDLERS, ModuleContext.bindCommands(config.queries));
        }
        this.config = config;
        this.modules = config.modules ?? [];
    }

    public async load(container: interfaces.Container): Promise<void> {
        await container.loadAsync(
            createContainerModule(
                this.getServices()
            )
        );
    }

    public addFirstModuleContext(module: ModuleContext): void {
        this.modules.unshift(module);
    }

    private mergeModuleDependenciesConfig(): ServiceList {
        let config = new Map<string, IService>();
        for (const moduleDependency of this.modules) {
            config = new Map([...config, ...moduleDependency.getServices()]);
        }
        return config;
    }

    private getServices(): ServiceList {
        const dependencies = this.mergeModuleDependenciesConfig();
        return new Map([...dependencies, ...this.config.services]);
    }

    private static bindCommands(commands: ICommandHandler[]|IQueryHandler[]): IService {
        return {
            collection: commands
        };
    }
}
