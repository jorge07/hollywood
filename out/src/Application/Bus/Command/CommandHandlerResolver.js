"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandHandlerResolver {
    constructor() {
        this.handlers = {};
    }
    resolve(command, success, error) {
        const handler = this.getHandlerForCommand(command);
        handler && handler.handle(command, success, error);
    }
    addHandler(command, handler) {
        this.handlers[command.name] = handler;
        return this;
    }
    getHandlerForCommand(command) {
        const commandName = command.constructor.name;
        return this.handlers[commandName];
    }
}
exports.default = CommandHandlerResolver;
//# sourceMappingURL=CommandHandlerResolver.js.map