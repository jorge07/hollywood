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
Object.defineProperty(exports, "__esModule", { value: true });
class QueryHandlerResolver {
    constructor() {
        this.handlers = {};
    }
    execute(command, next) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.resolve(command);
        });
    }
    addHandler(command, handler) {
        this.handlers[command.name] = handler;
        return this;
    }
    resolve(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandlerFor(command);
            if (handler) {
                return yield handler.handle(command);
            }
            return null;
        });
    }
    getHandlerFor(command) {
        const commandName = command.constructor.name;
        return this.handlers[commandName];
    }
}
exports.default = QueryHandlerResolver;
//# sourceMappingURL=QueryResolver.js.map