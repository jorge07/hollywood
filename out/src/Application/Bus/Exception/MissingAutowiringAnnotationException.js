"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MissingAutowiringAnnotationException extends Error {
    constructor(target) {
        super(`Missing @autowiring annotation in ${target.constructor.name} command/query`);
    }
}
exports.default = MissingAutowiringAnnotationException;
//# sourceMappingURL=MissingAutowiringAnnotationException.js.map