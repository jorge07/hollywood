"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bus {
    constructor(handlerResolver) {
        this.handlerResolver = handlerResolver;
    }
    handle(command) {
        return this.handlerResolver.resolve(command);
    }
}
exports.Bus = Bus;
//# sourceMappingURL=Bus.js.map