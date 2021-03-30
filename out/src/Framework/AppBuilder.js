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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = __importDefault(require("../Application/App"));
const Aliases = __importStar(require("./Container/Bridge/Alias"));
const MissingAutowiringAnnotationException_1 = __importDefault(require("../Application/Bus/Exception/MissingAutowiringAnnotationException"));
function mapHandler(handlers, collection) {
    const commandName = (target) => {
        if (!target.command) {
            throw new MissingAutowiringAnnotationException_1.default(target);
        }
        return target.command;
    };
    if (handlers.length > 0) {
        for (const handler of handlers.filter(Boolean)) {
            collection.set(commandName(handler), handler);
        }
    }
}
function AppBuilder(container) {
    const commands = new Map();
    const queries = new Map();
    const commandHandlers = container.getAll(Aliases.SERVICES_ALIAS.COMMAND_HANDLERS);
    const queryHandlers = container.getAll(Aliases.SERVICES_ALIAS.QUERY_HANDLERS);
    const commandMiddlewares = container.getAll(Aliases.SERVICES_ALIAS.COMMAND_MIDDLEWARE);
    const queryMiddlewares = container.getAll(Aliases.SERVICES_ALIAS.QUERY_MIDDLEWARE);
    mapHandler(commandHandlers, commands);
    mapHandler(queryHandlers, queries);
    return new App_1.default(commands, queries, commandMiddlewares, queryMiddlewares);
}
exports.default = AppBuilder;
//# sourceMappingURL=AppBuilder.js.map