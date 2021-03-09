"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StandardType(bind) {
    return (key, serviceDefinition) => bind(key).to(serviceDefinition.instance).inSingletonScope();
}
exports.default = StandardType;
//# sourceMappingURL=StandardType.js.map