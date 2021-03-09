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
const CommandHandlerResolver_1 = __importDefault(require("./Bus/Command/CommandHandlerResolver"));
const QueryResolver_1 = __importDefault(require("./Bus/Query/QueryResolver"));
const CommandBus_1 = __importDefault(require("./Bus/Command/CommandBus"));
const QueryBus_1 = __importDefault(require("./Bus/Query/QueryBus"));
class App {
    constructor(commands, queries, commandBusMiddlewares = [], queryBusMiddlewares = []) {
        this.commandResolver = new CommandHandlerResolver_1.default();
        this.queryResolver = new QueryResolver_1.default();
        this.bindResolvers(commands, queries);
        this.commandBus = new CommandBus_1.default(...commandBusMiddlewares, this.commandResolver);
        this.queryBus = new QueryBus_1.default(...queryBusMiddlewares, this.queryResolver);
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryBus.ask(query);
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.commandBus.handle(command);
        });
    }
    bindResolvers(commands, queries) {
        commands.forEach((handler, key) => this.registerCommand(key, handler));
        queries.forEach((handler, key) => this.registerQuery(key, handler));
    }
    registerCommand(command, handler) {
        this.commandResolver.addHandler(command, handler);
    }
    registerQuery(query, handler) {
        this.queryResolver.addHandler(query, handler);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map