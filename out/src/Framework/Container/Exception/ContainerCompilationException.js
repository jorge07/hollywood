"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ContainerCompilationException extends Error {
    constructor(reason) {
        super(`Container Compilation Error: ${reason}`);
    }
}
exports.default = ContainerCompilationException;
//# sourceMappingURL=ContainerCompilationException.js.map