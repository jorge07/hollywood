"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bus {
    constructor(handlerResolver) {
        this.handlerResolver = handlerResolver;
    }
    handle(command, success, error) {
        this.handlerResolver.resolve(command, success, error);
    }
}
exports.default = Bus;
//# sourceMappingURL=CommandBus.js.map