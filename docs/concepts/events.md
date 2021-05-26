# Domain Events

An event is something that has happened in the past inside an [**aggregate**](concepts/aggregate.md). 
Are immutable and represents a change in the state **represented as verbs in the past tense**.

Let's imagine a **User** than can be *created* and can *place* some **Orders**:

```typescript
import { Domain } from "hollywood-js";

export class UserWasCreated extends Domain.DomainEvent {
    constructor(public readonly aggregateRootId: string, public readonly email: string) {
        super()
    }
}

export class OrderPlaced extends Domain.DomainEvent {
    constructor(public readonly aggregateRootId: string, public readonly order: Order) {
        super()
    }
}


export default class User extends Domain.EventSourcedAggregateRoot {
    
    public static create(uuid: string, email: string): User {
        const instance = new User(uuid, email);
        instance.raise(new UserWasCreated(uuid, email));
        return instance;
    }

    private constructor(
        uuid: string,
        public readonly email: string,
    ) {
        super(uuid);
    }
    
    public placeOrder(order: Order): void {
        instance.raise(new OrderPlaced(this.getAggregateRootId(), order));
    }
    
    // Methods with the following format: *apply{DomainEvent.constructor.name}* will be called synconously with the domain event as input.
    // And will call AggregateRoot and Child Entities if exists.
    protected applyOrderPlaced(event: OrderPlaced): void {
        // Some business logicDomainEventStream
    }
}
```

`User.getUncommittedEvents()` will return a **DomainEventStream** instance which is, basically, a collection of events.

> Next: [**Event Listeners**](concepts/event-listeners.md)
