"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metadataKey = "design:paramtypes";
const propertykey = "handle";
function autowiring(target, propertyKey, descriptor) {
    const methodArgs = Reflect.getMetadata(metadataKey, target, propertykey);
    target.command = {
        name: methodArgs[0].name,
    };
}
exports.default = autowiring;
//# sourceMappingURL=autowiring.js.map