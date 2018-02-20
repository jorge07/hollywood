import {DomainEvent} from "../../Domain/Event/DomainEvent";

export class EventSubscriber {

    on(event: DomainEvent): void
    {
        if (this['on' + (<any> event).constructor.name]) {
            this['on' + (<any> event).constructor.name](event)
        }
    }
}