import { Domain } from '../..'

export class UserWasCreated extends Domain.DomainEvent {

    constructor(public uuid: string, public email: string){
        super()
    }
}
