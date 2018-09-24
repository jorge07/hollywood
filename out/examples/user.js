"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Domain = require("../src/Domain");
class UserWasCreated extends Domain.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserWasCreated = UserWasCreated;
class UserSayHello extends Domain.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserSayHello = UserSayHello;
class User extends Domain.EventSourced {
    constructor() {
        super();
    }
    getAggregateRootId() {
        return this.uuid;
    }
    static create(uuid, email) {
        const instance = new User();
        instance.raise(new UserWasCreated(uuid, email));
        return instance;
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