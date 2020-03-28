"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parameterBinder(container, parameters) {
    parameters.forEach((parameter, key) => {
        container.bind(key).toConstantValue(parameter);
    });
}
exports.default = parameterBinder;
//# sourceMappingURL=ParameterBinder.js.map