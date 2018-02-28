import { User, UserSayHello, UserWasCreated } from "./User";
import { ICommandHandler, ICommand, IQueryHandler, IQuery, HandlerResolver, Bus } from "../src/Application";
import { IEventStore, EventSubscriber, InMemoryEventStore, EventBus } from "../src/EventStore";
import { IRepository } from "../src/Domain/";

class UserRepository implements IRepository {

    constructor(private eventStore: IEventStore){}

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

class CreateUser implements ICommand {
    constructor(public uuid: string, public email: string) {}
}

class UserCreateHandler implements ICommandHandler {

    constructor(private userRepository: UserRepository) {}

    handle(c: CreateUser): void {
        const user = (new User).create(c.uuid, c.email);

        this.userRepository.save(user)
    }
}

class SayHello implements ICommand {
    constructor(public uuid: string) {}
}

class SayHelloHandler implements ICommandHandler {

    constructor(
        private userRepository: UserRepository
    ) {}

    handle(c: SayHello): void {

        const user = this.userRepository.load(c.uuid);

        console.log(user.sayHello());

        this.userRepository.save(user)
    }
}

class QueryDemo implements IQuery {}

class DemoQueryHandler implements IQueryHandler {

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

