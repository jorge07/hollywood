"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppBuilder_1 = __importDefault(require("./AppBuilder"));
const Builder_1 = require("./Container/Builder");
class Kernel {
    constructor(env, container) {
        this.env = env;
        this.container = container;
        this.app = AppBuilder_1.default(this.container);
    }
    static async createFromModuleContext(env, parameters, moduleContext, testParameters = new Map()) {
        parameters = Kernel.overwriteParamsOnTest(env, parameters, testParameters);
        const container = await Builder_1.BuildFromModuleContext(parameters, moduleContext);
        return new Kernel(env, container);
    }
    static overwriteParamsOnTest(env, parameters, testParameters) {
        if (env === "test") {
            return new Map([...parameters, ...testParameters]);
        }
        return parameters;
    }
}
exports.default = Kernel;
//# sourceMappingURL=Kernel.js.map