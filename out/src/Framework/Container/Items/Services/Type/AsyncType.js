"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAsyncType = void 0;
function IsAsyncType(serviceDefinition) {
    return !!serviceDefinition.async;
}
exports.IsAsyncType = IsAsyncType;
function AsyncType(rebind, isBound, bind) {
    return async (key, serviceDefinition) => {
        if (serviceDefinition.async) {
            const service = await serviceDefinition.async();
            if (isBound(key)) {
                return rebind(key).toConstantValue(service);
            }
            bind(key).toConstantValue(service);
        }
    };
}
exports.default = AsyncType;
//# sourceMappingURL=AsyncType.js.map