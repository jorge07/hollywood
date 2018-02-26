import {User, UserSayHello, UserWasCreated} from "./user";
import {CommandHandler} from "../src/Application/Bus/Command/CommandHandler";
import {QueryHandler} from "../src/Application/Bus/Query/QueryHandler";
import {Query} from "../src/Application/Bus/Query/Query";
import {HandlerResolver} from "../src/Application/Bus/Resolver";
import {Bus} from "../src/Application/Bus/Bus";
import {Repository} from "../src/Domain/Repository/Repository";
import {EventStore} from "../src/EventStore/EventBus/EventStore";
import {EventSubscriber} from "../src/EventStore/EventBus/EventSubscriber";
import {InMemoryEventStore} from "../src/EventStore/InMemoryEventStore";
import {EventBus} from "../src/EventStore/EventBus";
import {Command} from "../src/Application/Bus/Command/Command";

class UserRepository implements Repository {

    constructor(private eventStore: EventStore){}

    save(aggregateRoot: User): void {
        this.eventStore.append(aggregateRoot.getAggregateRootId(), aggregateRoot.getUncommitedEvents());
    }

    load(aggregateRootId: string): User {
        return (new User).fromHistory(this.eventStore.load(aggregateRootId));
    }
}

class OnUserWasCreated extends EventSubscriber {
    private onUserWasCreated(event: UserWasCreated): void {
        console.log(`User ${event.email} was created on ${event.ocurrendOn}`);
    }
}

class OnSayHello extends EventSubscriber {
    private onUserSayHello(event: UserSayHello): void {
        console.log(`User ${event.email} said: "Hello" at ${event.ocurrendOn}`);
    }
}

class CreateUser implements Command {
    constructor(public uuid: string, public email: string) {}
}

class UserCreateHandler implements CommandHandler {

    constructor(private userRepository: UserRepository) {}

    handle(c: CreateUser): void {
        const user = (new User).create(c.uuid, c.email);

        this.userRepository.save(user)
    }
}

class SayHello implements Command {
    constructor(public uuid: string) {}
}

class SayHelloHandler implements CommandHandler {

    constructor(
        private userRepository: UserRepository
    ) {}

    handle(c: SayHello): void {

        const user = this.userRepository.load(c.uuid);

        console.log(user.sayHello());

        this.userRepository.save(user)
    }
}

class QueryDemo implements Query {}

class DemoQueryHandler implements QueryHandler {

    async handle(query: QueryDemo): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(()=> {
                resolve('This is a async return query')
            }, 500)
        })
    }
}

// Provision User Store

let eventBus = new EventBus();
let onUserWasCreated = new OnUserWasCreated();
let onSayHello = new OnSayHello();

eventBus.attach(UserWasCreated, onUserWasCreated);
eventBus.attach(UserSayHello, onSayHello);

const userRepository = new UserRepository(new InMemoryEventStore(eventBus));

// Provision Bus

let resolver = new HandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));
resolver.addHandler(QueryDemo, new DemoQueryHandler());

let bus = new Bus(resolver);

let userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
bus.handle(new CreateUser(userUuid, 'lol@lol.com'));
bus.handle(new SayHello(userUuid));

bus.handle(new QueryDemo())
    .then((res) => console.log(res))
    .catch(err => (console.log(err)))
;

setTimeout(() => console.log('DONE'), 1000);

