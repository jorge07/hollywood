"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AddModules_1 = require("../Container/Items/Services/AddModules");
const Alias_1 = require("../Container/Bridge/Alias");
class ModuleContext {
    constructor(config) {
        var _a;
        if (config.commands) {
            config.services.set(Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS, ModuleContext.bindCommands(config.commands));
        }
        if (config.queries) {
            config.services.set(Alias_1.SERVICES_ALIAS.QUERY_HANDLERS, ModuleContext.bindCommands(config.queries));
        }
        this.config = config;
        this.modules = (_a = config.modules) !== null && _a !== void 0 ? _a : [];
    }
    async load(container) {
        await container.loadAsync(AddModules_1.createContainerModule(this.getServices()));
    }
    addFirstModuleContext(module) {
        this.modules.unshift(module);
    }
    mergeModuleDependenciesConfig() {
        let config = new Map();
        for (const moduleDependency of this.modules) {
            config = new Map([...config, ...moduleDependency.getServices()]);
        }
        return config;
    }
    getServices() {
        const dependencies = this.mergeModuleDependenciesConfig();
        return new Map([...dependencies, ...this.config.services]);
    }
    static bindCommands(commands) {
        return {
            collection: commands
        };
    }
}
exports.default = ModuleContext;
//# sourceMappingURL=ModuleContext.js.map