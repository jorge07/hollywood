"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Domain = __importStar(require("../src/Domain"));
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
    getAggregateRootId() {
        return this.uuid || "invalid";
    }
    static create(uuid, email) {
        const instance = new User();
        instance.raise(new UserWasCreated(uuid, email));
        return instance;
    }
    sayHello() {
        this.raise(new UserSayHello(this.getAggregateRootId(), this.email || "test"));
        return 'Hello!';
    }
    applyUserWasCreated(event) {
        this.uuid = event.uuid;
        this.email = event.email;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map