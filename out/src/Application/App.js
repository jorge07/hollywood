"use strict";
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
    async ask(query) {
        return this.queryBus.ask(query);
    }
    async handle(command) {
        await this.commandBus.handle(command);
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