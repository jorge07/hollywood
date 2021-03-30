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
class MessageBus {
    constructor(...middlewares) {
        this.middlewareChain = this.createChain(middlewares.filter(Boolean));
    }
    createChain(middlewares) {
        const chain = {};
        MessageBus.reverse(middlewares).filter(Boolean).forEach((middleware, key) => {
            chain[key] = (command) => __awaiter(this, void 0, void 0, function* () { return (middleware.execute(command, chain[key - 1])); });
        });
        return chain[middlewares.length - 1];
    }
    static reverse(middlewares) {
        return middlewares.reverse();
    }
}
exports.default = MessageBus;
//# sourceMappingURL=MessageBus.js.map