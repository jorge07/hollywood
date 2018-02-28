"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Domain_1 = require("../src/Domain");
class UserWasCreated extends Domain_1.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserWasCreated = UserWasCreated;
class UserSayHello extends Domain_1.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserSayHello = UserSayHello;
class User extends Domain_1.AggregateRoot {
    constructor() {
        super();
    }
    getAggregateRootId() {
        return this.uuid;
    }
    create(uuid, email) {
        super.raise(new UserWasCreated(uuid, email));
        return this;
    }
    sayHello() {
        super.raise(new UserSayHello(this.uuid, this.email));
        return 'Hello!';
    }
    applyUserWasCreated(event) {
        this.uuid = event.uuid;
        this.email = event.email;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map