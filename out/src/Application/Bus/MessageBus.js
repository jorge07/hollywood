"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageBus {
    constructor(...middlewares) {
        this.middlewareChain = this.createChain(middlewares.filter(Boolean));
    }
    createChain(middlewares) {
        const chain = {};
        MessageBus.reverse(middlewares).filter(Boolean).forEach((middleware, key) => {
            chain[key] = async (command) => (middleware.execute(command, chain[key - 1]));
        });
        return chain[middlewares.length - 1];
    }
    static reverse(middlewares) {
        return middlewares.reverse();
    }
}
exports.default = MessageBus;
//# sourceMappingURL=MessageBus.js.map