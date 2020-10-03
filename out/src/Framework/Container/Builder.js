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
const inversify_1 = require("inversify");
const ParameterBinder_1 = __importDefault(require("./ParameterBinder"));
const ServiceBinder_1 = __importDefault(require("./ServiceBinder"));
const Parameters_1 = require("./Bridge/Parameters");
const Services_1 = require("./Bridge/Services");
function Builder(services, parameters) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = new inversify_1.Container();
        ParameterBinder_1.default(container, new Map([...Parameters_1.PARAMETERS, ...parameters]));
        yield ServiceBinder_1.default(container, new Map([...Services_1.SERVICES, ...services]));
        return container;
    });
}
exports.default = Builder;
//# sourceMappingURL=Builder.js.map