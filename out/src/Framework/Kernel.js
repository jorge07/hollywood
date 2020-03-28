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
const Alias_1 = require("./Container/Bridge/Alias");
const Services_1 = require("./Container/Bridge/Services");
const Parameters_1 = require("./Container/Bridge/Parameters");
const Builder_1 = __importDefault(require("./Container/Builder"));
class Kernel {
    constructor(debug = false, env = "dev", container) {
        this.debug = debug;
        this.env = env;
        this.container = container;
        this.app = this.container.get(Alias_1.SERVICES_ALIAS.APP_BRIDGE);
    }
    static create(env = "dev", debug = false, services, parameters, testServices = new Map(), testParameters = new Map()) {
        return __awaiter(this, void 0, void 0, function* () {
            let servicesMap = new Map([...Services_1.LIST, ...services]);
            let parametersMap = new Map([...Parameters_1.PARAMETERS, ...parameters]);
            let container;
            if (env === "test") {
                parametersMap = new Map([...parameters, ...testParameters]);
                servicesMap = new Map([...servicesMap, ...testServices]);
            }
            try {
                container = yield Builder_1.default(servicesMap, parametersMap);
            }
            catch (error) {
                throw new Error("Container Compilation Error: " + error.message);
            }
            return new Kernel(debug, env, container);
        });
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.app.ask(query);
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.handle(command);
        });
    }
    get(identifier) {
        return this.container.get(identifier);
    }
    resolve(identifier) {
        return this.container.resolve(identifier);
    }
}
exports.default = Kernel;
//# sourceMappingURL=Kernel.js.map