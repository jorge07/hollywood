"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StandardType(rebind, isBound, bind) {
    return (key, serviceDefinition) => {
        if (isBound(key)) {
            rebind(key).to(serviceDefinition.instance).inSingletonScope();
        }
        bind(key).to(serviceDefinition.instance).inSingletonScope();
    };
}
exports.default = StandardType;
//# sourceMappingURL=StandardType.js.map