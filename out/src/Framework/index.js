"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Kernel_1 = __importDefault(require("./Kernel"));
exports.Kernel = Kernel_1.default;
const AppBridge_1 = __importDefault(require("./AppBridge"));
exports.AppBridge = AppBridge_1.default;
const Alias_1 = require("./Container/Bridge/Alias");
exports.SERVICES_ALIAS = Alias_1.SERVICES_ALIAS;
exports.PARAMETERS_ALIAS = Alias_1.PARAMETERS_ALIAS;
//# sourceMappingURL=index.js.map