"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// ts-node examples/domain/example.domain.ts
const User_1 = __importDefault(require("./User"));
const user = User_1.default.create("1", "demo@example.org");
// tslint:disable-next-line:no-console
console.log(user.getUncommittedEvents());
//# sourceMappingURL=example.domain.js.map