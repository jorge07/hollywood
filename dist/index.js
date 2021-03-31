"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadModel = exports.Framework = exports.EventSourcing = exports.Domain = exports.Application = void 0;
const Domain = __importStar(require("./src/Domain"));
exports.Domain = Domain;
const Application = __importStar(require("./src/Application"));
exports.Application = Application;
const EventSourcing = __importStar(require("./src/EventSourcing"));
exports.EventSourcing = EventSourcing;
const Framework = __importStar(require("./src/Framework"));
exports.Framework = Framework;
const ReadModel = __importStar(require("./src/ReadModel"));
exports.ReadModel = ReadModel;
//# sourceMappingURL=index.js.map