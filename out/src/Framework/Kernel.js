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
const AppBuilder_1 = __importDefault(require("./AppBuilder"));
const Builder_1 = require("./Container/Builder");
class Kernel {
    constructor(debug = false, env = "dev", container) {
        this.debug = debug;
        this.env = env;
        this.container = container;
        this.app = new AppBuilder_1.default(this.container);
    }
    static createFromModuleContext(env = "dev", debug = false, parameters, moduleContext, testParameters = new Map()) {
        return __awaiter(this, void 0, void 0, function* () {
            parameters = Kernel.overwriteParamsOnTest(env, parameters, testParameters);
            const container = yield Builder_1.BuildFromModuleContext(parameters, moduleContext);
            return new Kernel(debug, env, container);
        });
    }
    static overwriteParamsOnTest(env, parameters, testParameters) {
        if (env === "test") {
            return new Map([...parameters, ...testParameters]);
        }
        return parameters;
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.app.ask(query);
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.handle(command);
        });
    }
}
exports.default = Kernel;
//# sourceMappingURL=Kernel.js.map