"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parameterBinder(container, parameters) {
    for (const [key, parameter] of parameters) {
        container.bind(key).toConstantValue(parameter);
    }
}
exports.default = parameterBinder;
//# sourceMappingURL=ParameterBinder.js.map