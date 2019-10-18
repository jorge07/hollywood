"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function autowiring(target, propertyKey, descriptor) {
    const value = Reflect.getMetadata("design:paramtypes", target, "handle");
    target.command = {
        name: value[0].name,
    };
}
exports.default = autowiring;
//# sourceMappingURL=autowiring.js.map