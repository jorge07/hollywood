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
    public readonly containerModule: interfaces.AsyncContainerModule
    constructor(config: ModuleConfig) {
        if (config.commands) {
            config.services.set(SERVICES_ALIAS.COMMAND_HANDLERS, ModuleContext.bindCommands(config.commands));
        }
        if (config.queries) {
            config.services.set(SERVICES_ALIAS.QUERY_HANDLERS, ModuleContext.bindCommands(config.queries));
        }
        this.containerModule = createContainerModule(config.services);
        this.modules = config.modules ?? [];
    }

    public async load(container: interfaces.Container): Promise<void> {
        await container.loadAsync(...this.modules.map(moduleContext => moduleContext.containerModule));
        await container.loadAsync(this.containerModule);
    }

    private static bindCommands(commands: ICommandHandler[]|IQueryHandler[]): IService {
        return {
            collection: commands
        };
    }
}
