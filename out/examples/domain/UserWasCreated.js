"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWasCreated = void 0;
const __1 = require("../..");
class UserWasCreated extends __1.Domain.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserWasCreated = UserWasCreated;
//# sourceMappingURL=UserWasCreated.js.map