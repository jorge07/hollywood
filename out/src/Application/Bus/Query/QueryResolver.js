"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryHandlerResolver {
    constructor() {
        this.handlers = {};
    }
    async execute(command, next) {
        return await this.resolve(command);
    }
    addHandler(command, handler) {
        this.handlers[command.name] = handler;
        return this;
    }
    async resolve(command) {
        const handler = this.getHandlerFor(command);
        if (handler) {
            return await handler.handle(command);
        }
        return null;
    }
    getHandlerFor(command) {
        const commandName = command.constructor.name;
        return this.handlers[commandName];
    }
}
exports.default = QueryHandlerResolver;
//# sourceMappingURL=QueryResolver.js.map