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
const App_1 = __importDefault(require("../Application/App"));
const Alias_1 = require("./Container/Bridge/Alias");
const MissingAutowiringAnnotationException_1 = __importDefault(require("../Application/Bus/Exception/MissingAutowiringAnnotationException"));
class AppBuilder {
    constructor(container) {
        const commands = new Map();
        const queries = new Map();
        const commandHandlers = container.getAll(Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS);
        const queryHandlers = container.getAll(Alias_1.SERVICES_ALIAS.QUERY_HANDLERS);
        const commandMiddlewares = container.getAll(Alias_1.SERVICES_ALIAS.COMMAND_MIDDLEWARE);
        const queryMiddlewares = container.getAll(Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE);
        AppBuilder.mapHandler(commandHandlers, commands);
        AppBuilder.mapHandler(queryHandlers, queries);
        this.app = new App_1.default(commands, queries, commandMiddlewares, queryMiddlewares);
    }
    static mapHandler(handlers, collection) {
        const commandName = (target) => {
            if (!target.command) {
                throw new MissingAutowiringAnnotationException_1.default(target);
            }
            return target.command;
        };
        if (handlers.length > 1) {
            for (const handler of handlers) {
                if (!handler) {
                    continue;
                }
                collection.set(commandName(handler), handler);
            }
        }
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
exports.default = AppBuilder;
//# sourceMappingURL=AppBuilder.js.map