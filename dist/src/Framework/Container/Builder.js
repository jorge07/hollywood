"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildFromModuleContext = void 0;
const inversify_1 = require("inversify");
const ParameterBinder_1 = __importDefault(require("./ParameterBinder"));
const Parameters_1 = require("./Bridge/Parameters");
const ContainerCompilationException_1 = __importDefault(require("./Exception/ContainerCompilationException"));
const HollywoodModule_1 = require("../HollywoodModule");
const ListenerType_1 = require("./Items/Services/Type/ListenerType");
async function BuildFromModuleContext(parameters, moduleContext) {
    try {
        const container = new inversify_1.Container();
        ParameterBinder_1.default(container, new Map([...Parameters_1.PARAMETERS, ...parameters]));
        moduleContext.addFirstModuleContext(HollywoodModule_1.HollywoodModule());
        await moduleContext.load(container);
        // Initialize listeners
        ListenerType_1.BindListeners(container);
        return container;
    }
    catch (error) {
        throw new ContainerCompilationException_1.default(error.message);
    }
}
exports.BuildFromModuleContext = BuildFromModuleContext;
//# sourceMappingURL=Builder.js.map