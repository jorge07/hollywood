"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.containerModule = AddModules_1.createContainerModule(config.services);
        this.modules = (_a = config.modules) !== null && _a !== void 0 ? _a : [];
    }
    load(container) {
        return __awaiter(this, void 0, void 0, function* () {
            yield container.loadAsync(...this.modules.map(moduleContext => moduleContext.containerModule));
            yield container.loadAsync(this.containerModule);
        });
    }
    static bindCommands(commands) {
        return {
            collection: commands
        };
    }
}
exports.default = ModuleContext;
//# sourceMappingURL=ModuleContext.js.map