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
class UserRepository {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    latency() {
        return new Promise(resolve => setTimeout(resolve, 150));
    }
    save(aggregateRoot) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.latency().then(() => {
                this.eventStore.append(aggregateRoot.getAggregateRootId(), aggregateRoot.getUncommitedEvents());
            });
        });
    }
    load(aggregateRootId) {
        return (new User_1.User).fromHistory(this.eventStore.load(aggregateRootId));
    }
}
class OnUserWasCreated extends _1.EventStore.EventSubscriber {
    onUserWasCreated(event) {
        console.log(`EVENT: OnUserWasCreated: User ${event.email} was created on ${event.ocurrendOn}`);
    }
}
class OnSayHello extends _1.EventStore.EventSubscriber {
    onUserSayHello(event) {
        console.log(`User ${event.email} said: "Hello" at ${event.ocurrendOn}`);
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
    handle(c, callback) {
        const user = (new User_1.User).create(c.uuid, c.email);
        this.userRepository.save(user).then(() => {
            callback && callback({ data: 'User Created ACK' });
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
    handle(c, callback) {
        const user = this.userRepository.load(c.uuid);
        console.log(user.sayHello());
        this.userRepository.save(user);
        callback({ data: 'User say Hello ACK' });
    }
}
class QueryDemo {
}
exports.QueryDemo = QueryDemo;
class DemoQueryHandler {
    handle(query, success, error) {
        setTimeout(() => {
            success({ data: 'This is a async return query' });
        }, 500);
    }
}
// Provision User Store
const eventBus = new _1.EventStore.EventBus();
const onUserWasCreated = new OnUserWasCreated();
const onSayHello = new OnSayHello();
eventBus.attach(User_1.UserWasCreated, onUserWasCreated);
eventBus.attach(User_1.UserSayHello, onSayHello);
const userRepository = new UserRepository(new _1.EventStore.InMemoryEventStore(eventBus));
// Provision Bus
let resolver = new _1.Application.HandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));
resolver.addHandler(QueryDemo, new DemoQueryHandler());
const bus = new _1.Application.Bus(resolver);
exports.default = bus;
//# sourceMappingURL=CommandAndQueryHandlers.js.map