"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCustomType = void 0;
function IsCustomType(serviceDefinition) {
    return !!serviceDefinition.custom;
}
exports.IsCustomType = IsCustomType;
function CustomType(rebind, isBound, bind) {
    return (key, serviceDefinition) => {
        if (serviceDefinition.custom) {
            if (isBound(key)) {
                return rebind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
            }
            bind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
        }
    };
}
exports.default = CustomType;
//# sourceMappingURL=CustomType.js.map