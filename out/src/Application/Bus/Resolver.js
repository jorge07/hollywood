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
class HandlerResolver {
    constructor() {
        this._handlers = {};
    }
    resolve(command) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = this.getHandlerForCommand(command);
            return handler ? handler.handle(command) : null;
        });
    }
    addHandler(command, handler) {
        this._handlers[command.name] = handler;
        return this;
    }
    getHandlerForCommand(command) {
        let commandName = command.constructor.name;
        return this._handlers[commandName];
    }
}
exports.HandlerResolver = HandlerResolver;
//# sourceMappingURL=Resolver.js.map