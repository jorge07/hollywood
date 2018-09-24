"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
exports.UserSayHello = User_1.UserSayHello;
const _1 = require("../");
const App_1 = require("../src/Application/App");
const Repository_1 = require("../src/Domain/Repository/Repository");
class UserRepository extends Repository_1.default {
}
class OnUserWasCreated extends _1.EventStore.EventSubscriber {
    onUserWasCreated(event) {
        console.log(`EVENT: OnUserWasCreated: User ${event.email} was created`);
    }
}
class OnSayHello extends _1.EventStore.EventSubscriber {
    onUserSayHello(event) {
        console.log(`User ${event.email} said: "Hello"`);
    }
}
class CreateUser {
    constructor(uuid, email) {
        this.uuid = uuid;
        this.email = email;
    }
}
exports.CreateUser = CreateUser;
class UserCreateHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    handle(c) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = User_1.User.create(c.uuid, c.email);
            yield this.userRepository.save(user);
        });
    }
}
class SayHello {
    constructor(uuid) {
        this.uuid = uuid;
    }
}
class SayHelloHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    handle(c) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.load(c.uuid);
            yield this.userRepository.save(user);
        });
    }
}
class QueryDemo {
}
exports.QueryDemo = QueryDemo;
class DemoQueryHandler {
    handle(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        data: 'This is a async return query'
                    });
                }, 500);
            });
        });
    }
}
// Provision User Store
const eventBus = new _1.EventStore.EventBus();
const onUserWasCreated = new OnUserWasCreated();
const onSayHello = new OnSayHello();
eventBus.attach(User_1.UserWasCreated, onUserWasCreated);
eventBus.attach(User_1.UserSayHello, onSayHello);
const userRepository = new UserRepository(new _1.EventStore.EventStore(User_1.User, new _1.EventStore.InMemoryEventStore(), eventBus));
const app = new App_1.default(new Map([
    [CreateUser, new UserCreateHandler(userRepository)],
    [SayHello, new SayHelloHandler(userRepository)],
]), new Map([
    [QueryDemo, new DemoQueryHandler()]
]));
exports.default = app;
//# sourceMappingURL=CommandAndQueryHandlers.js.map