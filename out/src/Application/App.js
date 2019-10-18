"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Application_1 = require("../Application/");
class App {
    constructor(commands, queries) {
        this.commandResolver = new Application_1.CommandHandlerResolver();
        this.queryResolver = new Application_1.QueryHandlerResolver();
        commands.forEach((handler, key) => this.registerCommand(key, handler));
        queries.forEach((handler, key) => this.registerQuery(key, handler));
        this.commandBus = new Application_1.CommandBus(this.commandResolver);
        this.queryBus = new Application_1.QueryBus(this.queryResolver);
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.queryBus.ask(query);
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.commandBus.handle(command);
        });
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