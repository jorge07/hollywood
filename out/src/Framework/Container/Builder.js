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
function BuildFromModuleContext(parameters, moduleContext) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const container = new inversify_1.Container();
            ParameterBinder_1.default(container, new Map([...Parameters_1.PARAMETERS, ...parameters]));
            yield HollywoodModule_1.HollywoodModule().load(container);
            yield moduleContext.load(container);
            // Initialize listeners
            ListenerType_1.BindListeners(container);
            return container;
        }
        catch (error) {
            throw new ContainerCompilationException_1.default(error.message);
        }
    });
}
exports.BuildFromModuleContext = BuildFromModuleContext;
//# sourceMappingURL=Builder.js.map