"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAsyncType = void 0;
function IsAsyncType(serviceDefinition) {
    return !!serviceDefinition.async;
}
exports.IsAsyncType = IsAsyncType;
function AsyncType(rebind, isBound, bind) {
    return (key, serviceDefinition) => __awaiter(this, void 0, void 0, function* () {
        if (serviceDefinition.async) {
            const service = yield serviceDefinition.async();
            if (isBound(key)) {
                return rebind(key).toConstantValue(service);
            }
            bind(key).toConstantValue(service);
        }
    });
}
exports.default = AsyncType;
//# sourceMappingURL=AsyncType.js.map