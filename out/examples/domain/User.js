"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const UserWasCreated_1 = require("./UserWasCreated");
class User extends __1.Domain.EventSourcedAggregateRoot {
    constructor() {
        super(...arguments);
        this.uuid = "";
        this.email = "";
    }
    static create(uuid, email) {
        const instance = new User(uuid);
        instance.raise(new UserWasCreated_1.UserWasCreated(uuid, email));
        return instance;
    }
    getAggregateRootId() {
        return this.uuid;
    }
    applyUserWasCreated(event) {
        this.uuid = event.uuid;
        this.email = event.email;
    }
    get mail() {
        return this.email;
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map