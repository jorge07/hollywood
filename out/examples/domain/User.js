"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const UserWasCreated_1 = require("./UserWasCreated");
const EventSourcedAggregateRoot_1 = __importDefault(require("../../src/Domain/EventSourcedAggregateRoot"));
class User extends EventSourcedAggregateRoot_1.default {
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