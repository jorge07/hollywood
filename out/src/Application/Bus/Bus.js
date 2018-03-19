"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bus {
    constructor(handlerResolver) {
        this.handlerResolver = handlerResolver;
    }
    handle(command, callback) {
        this.handlerResolver.resolve(command, callback);
    }
}
exports.default = Bus;
//# sourceMappingURL=Bus.js.map