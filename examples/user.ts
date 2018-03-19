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
    uuid: string;

    email: string;

    constructor() {
        super()
    }

    getAggregateRootId(): string {
        return this.uuid
    }

    create(uuid: string, email: string) {
        super.raise(new UserWasCreated(uuid, email));

        return this
    }

    sayHello(): string {
        super.raise(new UserSayHello(this.uuid, this.email));
        
        return 'Hello!'
    }

    applyUserWasCreated(event: UserWasCreated): void {
        this.uuid = event.uuid;
        this.email = event.email;
    }
}
