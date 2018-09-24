import { User, UserSayHello, UserWasCreated } from "./User";
import { Application, EventStore, Domain } from "../";
import App from '../src/Application/App';
import ICommandHandler from '../src/Application/Bus/Command/CommandHandler';
import IQueryHandler from '../src/Application/Bus/Query/QueryHandler';
import Repository from '../src/Domain/Repository/Repository';

class UserRepository extends Repository<User> {

}

class OnUserWasCreated extends EventStore.EventSubscriber {
    private onUserWasCreated(event: UserWasCreated): void {
        console.log(`EVENT: OnUserWasCreated: User ${event.email} was created`);
    }
}

class OnSayHello extends EventStore.EventSubscriber {
    private onUserSayHello(event: UserSayHello): void {
        console.log(`User ${event.email} said: "Hello"`);
    }
}

class CreateUser implements Application.ICommand {
    constructor(public uuid: string, public email: string) {}
}

class UserCreateHandler implements Application.ICommandHandler {

    constructor(private userRepository: UserRepository) {}

    async handle(c: CreateUser): Promise<void|Application.IAppError> {
        const user = User.create(c.uuid, c.email);

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

    async handle(c: SayHello): Promise<void|Application.IAppError> {
        const user = await this.userRepository.load(c.uuid);

        await this.userRepository.save(user)
    }
}

class QueryDemo implements Application.IQuery {}

class DemoQueryHandler implements Application.IQueryHandler {

    async handle(query: QueryDemo): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(<Application.IAppResponse>{
                    data:'This is a async return query'
                })
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

const app: App = new App(
    new Map<any, ICommandHandler>(
        [
            [CreateUser, new UserCreateHandler(userRepository)],
            [SayHello, new SayHelloHandler(userRepository)],
        ]
    ), 
    new Map<any, IQueryHandler>(
        [
            [QueryDemo, new DemoQueryHandler()]
        ]
    )
);

export default app;

export {
     CreateUser,
     UserSayHello,
     QueryDemo
}; 