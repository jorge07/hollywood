import * as Domain from "../src/Domain";

export class UserWasCreated extends Domain.DomainEvent {

    constructor(public uuid: string, public email: string){
        super()
    }
}

export class UserSayHello extends Domain.DomainEvent {
    constructor(public uuid: string, public email: string) {
        super()
    }
}

export class User extends Domain.EventSourced {
    protected uuid?: string;

    protected email?: string;

    getAggregateRootId(): string {
        return this.uuid || "invalid"
    }

    static create(uuid: string, email: string): User {

        const instance = new User();
        
        instance.raise(new UserWasCreated(uuid, email));

        return instance;
    }

    sayHello(): string {
        this.raise(new UserSayHello(
            this.getAggregateRootId(), 
            this.email || "test"
        ));
        
        return 'Hello!'
    }

    applyUserWasCreated(event: UserWasCreated): void {
        this.uuid = event.uuid;
        this.email = event.email;
    }
}
