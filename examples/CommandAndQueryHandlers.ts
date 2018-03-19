import { User, UserSayHello, UserWasCreated } from './User';
import { Application, EventStore, Domain } from "../";
import { AppResponse } from '../src/Application/Bus/Query/CallbackArg';

class UserRepository implements Domain.IRepository {

    constructor(private readonly eventStore: EventStore.IEventStore){}

    latency() {
        return new Promise(resolve => setTimeout(resolve, 150));
    }

    async save(aggregateRoot: User): Promise<any> {
        
        return await this.latency().then(() => {
            this.eventStore.append(
                aggregateRoot.getAggregateRootId(), 
                aggregateRoot.getUncommitedEvents()
            );
        })
    }

    load(aggregateRootId: string): User {
        return (new User).fromHistory(this.eventStore.load(aggregateRootId));
    }
}

class OnUserWasCreated extends EventStore.EventSubscriber {
    private onUserWasCreated(event: UserWasCreated): void {
        console.log(`EVENT: OnUserWasCreated: User ${event.email} was created on ${event.ocurrendOn}`);
    }
}

class OnSayHello extends EventStore.EventSubscriber {
    private onUserSayHello(event: UserSayHello): void {
        console.log(`User ${event.email} said: "Hello" at ${event.ocurrendOn}`);
    }
}

class CreateUser implements Application.ICommand {
    constructor(public uuid: string, public email: string) {}
}

class UserCreateHandler implements Application.ICommandHandler {

    constructor(private userRepository: UserRepository) {}

    handle(c: CreateUser, callback: Function): void {
        const user = (new User).create(c.uuid, c.email);

        this.userRepository.save(user).then(() => {
            callback && callback(<AppResponse>{data: 'User Created ACK'});
        })
    }
}

class SayHello implements Application.ICommand {
    constructor(public uuid: string) {}
}

class SayHelloHandler implements Application.ICommandHandler {

    constructor(
        private userRepository: UserRepository
    ) {}

    handle(c: SayHello, callback: Function): void {

        const user = this.userRepository.load(c.uuid);

        console.log(user.sayHello());

        this.userRepository.save(user)

        callback(<AppResponse>{data: 'User say Hello ACK'});
    }
}

class QueryDemo implements Application.IQuery {}

class DemoQueryHandler implements Application.IQueryHandler {

    handle(query: QueryDemo, callback: Function): void {
        
        setTimeout(()=> {
            callback('This is a async return query')
        }, 500)
    }
}

// Provision User Store

const eventBus = new EventStore.EventBus();
const onUserWasCreated = new OnUserWasCreated();
const onSayHello = new OnSayHello();

eventBus.attach(UserWasCreated, onUserWasCreated);
eventBus.attach(UserSayHello, onSayHello);

const userRepository = new UserRepository(new EventStore.InMemoryEventStore(eventBus));

// Provision Bus

let resolver = new Application.HandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));
resolver.addHandler(QueryDemo, new DemoQueryHandler());

const bus = new Application.Bus(resolver);

export default bus;

export {
     CreateUser,
     UserSayHello,
     QueryDemo
}; 