import type { ServiceList } from "../Container/Items/Service";
import type { interfaces } from "inversify";
export interface ModuleConfig {
    commands?: any[];
    queries?: any[];
    services: ServiceList;
    modules?: ModuleContext[];
}
export default class ModuleContext {
    readonly modules: ModuleContext[];
    readonly config: ModuleConfig;
    constructor(config: ModuleConfig);
    load(container: interfaces.Container): Promise<void>;
    addFirstModuleContext(module: ModuleContext): void;
    private mergeModuleDependenciesConfig;
    private getServices;
    private static bindCommands;
}
