import type {IService, ServiceList, Constructor} from "../Container/Items/Service";
import type { interfaces } from "inversify";
import { createContainerModule } from "../Container/Items/Services/AddModules";
import {SERVICES_ALIAS} from "../Container/Bridge/Alias";

/**
 * Module configuration interface.
 */
export interface ModuleConfig {
    /** Command handler constructors */
    commands?: Constructor[]
    /** Query handler constructors */
    queries?: Constructor[]
    /** Service definitions - can be Map or object literal */
    services: ServiceList
    /** Nested module contexts */
    modules?: ModuleContext[]
}

/**
 * Normalizes service list to Map format.
 * Accepts both Map and object literal for backward compatibility and better DX.
 *
 * @param services - Service list as Map or object literal
 * @returns Normalized Map of services
 */
function normalizeServiceList(services: ServiceList): Map<string, IService> {
    if (services instanceof Map) {
        return services;
    }

    // Convert object literal to Map
    return new Map(Object.entries(services));
}

export default class ModuleContext {
    public readonly modules: ModuleContext[]
    public readonly config: ModuleConfig
    private readonly normalizedServices: Map<string, IService>

    constructor(config: ModuleConfig) {
        // Normalize services to Map internally
        this.normalizedServices = normalizeServiceList(config.services);

        if (config.commands) {
            this.normalizedServices.set(SERVICES_ALIAS.COMMAND_HANDLERS, ModuleContext.bindHandlers(config.commands));
        }
        if (config.queries) {
            this.normalizedServices.set(SERVICES_ALIAS.QUERY_HANDLERS, ModuleContext.bindHandlers(config.queries));
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

    private mergeModuleDependenciesConfig(): Map<string, IService> {
        let config = new Map<string, IService>();
        for (const moduleDependency of this.modules) {
            config = new Map([...config, ...moduleDependency.getServices()]);
        }
        return config;
    }

    private getServices(): Map<string, IService> {
        const dependencies = this.mergeModuleDependenciesConfig();
        return new Map([...dependencies, ...this.normalizedServices]);
    }

    private static bindHandlers(handlers: Constructor[]): IService {
        return {
            collection: handlers
        };
    }
}
