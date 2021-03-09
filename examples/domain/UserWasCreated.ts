import DomainEvent from "../../src/Domain/Event/DomainEvent";

export class UserWasCreated extends DomainEvent {
    constructor(public uuid: string, public email: string){
        super()
    }
}
