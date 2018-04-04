import { User, UserSayHello, UserWasCreated } from './User';
import { Application, EventStore, Domain } from "../";

class UserRepository implements Domain.IRepository {

    constructor(private readonly eventStore: EventStore.EventStore<User>){}

    async save(aggregateRoot: User): Promise<any> {
        
        return await this.latency().then(() => {
            this.eventStore.save(aggregateRoot);
        })
    }

    async load(aggregateRootId: string): Promise<User> {
        return await this.eventStore.load(aggregateRootId);
    }

    private latency(): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, 150));
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

    async handle(c: CreateUser): Promise<void|Application.AppError> {
        const user = (new User).create(c.uuid, c.email);

        await this.userRepository.save(user)
    }
}

class SayHello implements Application.ICommand {
    constructor(public uuid: string) {}
}

class SayHelloHandler implements Application.ICommandHandler {

    constructor(
        private userRepository: UserRepository
    ) {}

    async handle(c: SayHello): Promise<void|Application.AppError> {
        const user = await this.userRepository.load(c.uuid);

        await this.userRepository.save(user)
    }
}

class QueryDemo implements Application.IQuery {}

class DemoQueryHandler implements Application.IQueryHandler {

    async handle(query: QueryDemo): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(<Application.AppResponse>{data:'This is a async return query'})
            }, 500)
        })

    }
}

// Provision User Store

const eventBus = new EventStore.EventBus();
const onUserWasCreated = new OnUserWasCreated();
const onSayHello = new OnSayHello();

eventBus.attach(UserWasCreated, onUserWasCreated);
eventBus.attach(UserSayHello, onSayHello);

const userRepository = new UserRepository(new EventStore.EventStore<User>(User, new EventStore.InMemoryEventStore(), eventBus));

// Provision Bus

const resolver = new Application.CommandHandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));

const queryResolver =  new Application.QueryHandlerResolver()
queryResolver.addHandler(QueryDemo, new DemoQueryHandler());

const commandBus = new Application.CommandBus(resolver);

const queryBus = new Application.QueryBus(queryResolver);

export default commandBus;

export {
     CreateUser,
     UserSayHello,
     QueryDemo,
     queryBus
}; 