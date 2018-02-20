"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainEvent_1 = require("../src/Domain/Event/DomainEvent");
const AggregateRoot_1 = require("../src/Domain/AggregateRoot");
class UserWasCreated extends DomainEvent_1.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserWasCreated = UserWasCreated;
class UserSayHello extends DomainEvent_1.DomainEvent {
    constructor(uuid, email) {
        super();
        this.uuid = uuid;
        this.email = email;
    }
}
exports.UserSayHello = UserSayHello;
class User extends AggregateRoot_1.AggregateRoot {
    constructor() {
        super();
    }
    getAggregateRootId() {
        return this._uuid;
    }
    create(uuid, email) {
        super.raise(new UserWasCreated(uuid, email));
        return this;
    }
    sayHello() {
        super.raise(new UserSayHello(this._uuid, this._email));
        return 'Hello!';
    }
    applyUserWasCreated(event) {
        this._uuid = event.uuid;
        this._email = event.email;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map