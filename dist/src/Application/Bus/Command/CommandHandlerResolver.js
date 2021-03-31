"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandHandlerResolver {
    constructor() {
        this.handlers = {};
    }
    async execute(command, next) {
        await this.resolve(command);
    }
    addHandler(command, handler) {
        this.handlers[command.name] = handler;
        return this;
    }
    async resolve(command) {
        const handler = this.getHandlerForCommand(command);
        if (handler) {
            return await handler.handle(command);
        }
    }
    getHandlerForCommand(command) {
        const commandName = command.constructor.name;
        return this.handlers[commandName];
    }
}
exports.default = CommandHandlerResolver;
//# sourceMappingURL=CommandHandlerResolver.js.map