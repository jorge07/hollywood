"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWasCreated = void 0;
const DomainEvent_1 = __importDefault(require("../../src/Domain/Event/DomainEvent"));
class UserWasCreated extends DomainEvent_1.default {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserWasCreated = UserWasCreated;
//# sourceMappingURL=UserWasCreated.js.map