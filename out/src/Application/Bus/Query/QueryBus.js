"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MessageBus_1 = __importDefault(require("../MessageBus"));
class QueryBus extends MessageBus_1.default {
    constructor(...middlewares) {
        super(...middlewares);
    }
    async ask(command) {
        return await this.middlewareChain(command);
    }
}
exports.default = QueryBus;
//# sourceMappingURL=QueryBus.js.map