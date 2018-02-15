"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainEvent_1 = require("../src/Domain/Event/DomainEvent");
const AggregateRoot_1 = require("../src/Domain/AggregateRoot");
class UserWasCreated extends DomainEvent_1.DomainEvent {
    constructor(email) {
        super();
        this.email = email;
    }
}
class UserSayHello extends DomainEvent_1.DomainEvent {
}
class User extends AggregateRoot_1.AggregateRoot {
    constructor() {
        super();
        this._uuid = '11a38b9a-b3da-360f-9353-a5a725514269';
    }
    getAggregateRootId() {
        return this._uuid;
    }
    create(email) {
        super.raise(new UserWasCreated(email));
        return this;
    }
    sayHello() {
        super.raise(new UserSayHello());
        return 'Hello!';
    }
    applyUserWasCreated(event) {
        this.email = event.email;
    }
}
exports.User = User;
//# sourceMappingURL=user.js.map