import {DomainEvent} from "../src/Domain/Event/DomainEvent";
import {AggregateRoot} from "../src/Domain/AggregateRoot";

export class UserWasCreated extends DomainEvent {

    constructor(public uuid: string, public email: string){
        super()
    }
}

export class UserSayHello extends DomainEvent {
    constructor(public uuid: string, public email: string) {
        super()
    }
}

export class User extends AggregateRoot {
    _uuid: string;

    _email: string;

    constructor() {
        super()
    }

    getAggregateRootId(): string {
        return this._uuid
    }

    create(uuid: string, email: string) {
        super.raise(new UserWasCreated(uuid, email));

        return this
    }

    sayHello(): string {
        super.raise(new UserSayHello(this._uuid, this._email));
        
        return 'Hello!'
    }

    applyUserWasCreated(event: UserWasCreated): void {
        this._uuid = event.uuid;
        this._email = event.email;
    }
}
