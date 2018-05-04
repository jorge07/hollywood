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
    save(aggregateRoot) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.latency().then(() => {
                this.eventStore.save(aggregateRoot);
            });
        });
    }
    load(aggregateRootId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.eventStore.load(aggregateRootId);
        });
    }
    latency() {
        return new Promise(resolve => setTimeout(resolve, 150));
    }
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
            const user = (new User_1.User).create(c.uuid, c.email);
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
                    resolve({ data: 'This is a async return query' });
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
// Provision Bus
const resolver = new _1.Application.CommandHandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));
const queryResolver = new _1.Application.QueryHandlerResolver();
queryResolver.addHandler(QueryDemo, new DemoQueryHandler());
const commandBus = new _1.Application.CommandBus(resolver);
const queryBus = new _1.Application.QueryBus(queryResolver);
exports.queryBus = queryBus;
exports.default = commandBus;
//# sourceMappingURL=CommandAndQueryHandlers.js.map