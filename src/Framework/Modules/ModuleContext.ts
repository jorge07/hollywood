import type { ServiceList } from "../Container/Items/Service";
import type { interfaces } from "inversify";
import { createContainerModule } from "../Container/Items/Services/AddModules";

export interface ModuleConfig {
    services: ServiceList
    modules?: ModuleContext[]
}

export default class ModuleContext {
    public readonly modules: ModuleContext[]
    public readonly containerModule: interfaces.AsyncContainerModule
    constructor(config: ModuleConfig) {
        this.containerModule = createContainerModule(config.services);
        this.modules = config.modules ?? [];
    }

    public async load(container: interfaces.Container): Promise<void> {
        await container.loadAsync(...this.modules.map(moduleContext => moduleContext.containerModule));
        await container.loadAsync(this.containerModule);
    }
}
