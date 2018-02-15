"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Bus {
    constructor(_handlerResolver) {
        this._handlerResolver = _handlerResolver;
    }
    handle(command) {
        return this._handlerResolver.resolve(command);
    }
}
exports.Bus = Bus;
//# sourceMappingURL=Bus.js.map