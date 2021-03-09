"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsCollectionType = void 0;
function IsCollectionType(serviceDefinition) {
    return !!serviceDefinition.collection;
}
exports.IsCollectionType = IsCollectionType;
function CollectionType(bind) {
    return (key, serviceDefinition) => {
        var _a;
        if (((_a = serviceDefinition.collection) === null || _a === void 0 ? void 0 : _a.length) === 0) {
            // Empty null as marker of no content
            bind(key).toDynamicValue(() => null).inSingletonScope();
            return;
        }
        for (const item of serviceDefinition.collection || []) {
            bind(key).to(item).inSingletonScope();
        }
    };
}
exports.default = CollectionType;
//# sourceMappingURL=CollectionType.js.map