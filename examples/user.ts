import {DomainEvent} from "../src/Domain/Event/DomainEvent";
import {AggregateRoot} from "../src/Domain/AggregateRoot";

class UserWasCreated extends DomainEvent {

    constructor(public email: string){
        super()
    }
}

class UserSayHello extends DomainEvent {

}

export class User extends AggregateRoot {
    private _uuid: string = '11a38b9a-b3da-360f-9353-a5a725514269';

    email: string;

    constructor() {
        super()
    }

    getAggregateRootId(): string {
        return this._uuid
    }

    create(email: string) {
        super.raise(new UserWasCreated(email));

        return this
    }

    sayHello(): string {
        super.raise(new UserSayHello());
        
        return 'Hello!'
    }

    applyUserWasCreated(event: UserWasCreated): void {
        this.email = event.email
    }
}
