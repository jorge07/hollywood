"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCustomType = void 0;
function IsCustomType(serviceDefinition) {
    return !!serviceDefinition.custom;
}
exports.IsCustomType = IsCustomType;
function CustomType(bind) {
    return (key, serviceDefinition) => {
        if (serviceDefinition.custom) {
            bind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
        }
    };
}
exports.default = CustomType;
//# sourceMappingURL=CustomType.js.map