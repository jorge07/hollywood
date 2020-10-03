"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PARAMETERS_ALIAS = exports.SERVICES_ALIAS = exports.AppBridge = exports.Kernel = void 0;
const Kernel_1 = __importDefault(require("./Kernel"));
exports.Kernel = Kernel_1.default;
const AppBridge_1 = __importDefault(require("./AppBridge"));
exports.AppBridge = AppBridge_1.default;
const Alias_1 = require("./Container/Bridge/Alias");
Object.defineProperty(exports, "SERVICES_ALIAS", { enumerable: true, get: function () { return Alias_1.SERVICES_ALIAS; } });
Object.defineProperty(exports, "PARAMETERS_ALIAS", { enumerable: true, get: function () { return Alias_1.PARAMETERS_ALIAS; } });
//# sourceMappingURL=index.js.map