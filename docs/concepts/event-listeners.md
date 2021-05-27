# Event Listeners

A portion extract from the [.Net Architecture Book](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation#what-is-a-domain-event):

> Domain events are similar to messaging-style events, with one important difference. With real messaging, message queuing, message brokers, or a service bus using AMQP, a message is always sent asynchronously and communicated across processes and machines. This is useful for integrating multiple Bounded Contexts, microservices, or even different applications. However, with domain events, you want to raise an event from the domain operation you are currently running, but you want any side effects to occur within the same domain. The domain events and their side effects (the actions triggered afterwards that are managed by event handlers) should occur almost immediately, usually in-process, and within the same domain. Thus, domain events could be synchronous or asynchronous. Integration events, however, should always be asynchronous.

The **EventBus** will wait until all the **Listeners** are executed with the purpose of simplify transactions.

## Listeners vs Subscribers by example

```typescript
import { Domain } from "hollywood-js";

export class UserWasCreated extends Domain.DomainEvent {
    constructor(public readonly aggregateRootId: string, public readonly email: string) {
        super()
    }
}

export class PaymentConfirmed extends Domain.DomainEvent {
    constructor(public readonly aggregateRootId: string, public readonly order: Payment) {
        super()
    }
}
```

We're going to do a couple of things:

- A Welcome email
- An Order Confirmation email.
- Send all events to the BI department for statistics.

```typescript
import { Domain, EventSourcing } from "hollywood-js";

class WelcomeEmailSubscriber extends EventSourcing.EventSubscriber {

    protected async onUserWasCreated(event: UserWasCreated): Promise<void> {
        // send email
    }
}

class OrderConfirmationSubscriber extends EventSourcing.EventSubscriber {

    protected async onPaymentConfirmed(event: PaymentConfirmed): Promise<void> {
        // send email
    }
}

class BusinessIntelligenceListener extends EventSourcing.EventListener {

    protected async on(message: Domain.DomainMessage): Promise<void> {
        // send event to elastic.
    }
}
```

> Note: Listeners receive the entire DomainMessage object while Subscribers receive just the DomainEvent without the envelope.

## Configuring the **EventBus**

```typescript
import { EventSourcing } from "hollywood-js";

const eventBus = new EventSourcing.EventBus();

eventBus
    .attach(UserWasCreated, new WelcomeEmailSubscriber())
    .attach(PaymentConfirmed, new OrderConfirmationSubscriber())
    .addListener(new BusinessIntelligenceListener())
;

(async () => {
    await eventBus.publish(new UserWasCreated(...));
    // WelcomeEmailSubscriber & BusinessIntelligenceListener Called
    await eventBus.publish(new PaymentConfirmed(...));
    // OrderConfirmationSubscriber & BusinessIntelligenceListener Called
})()
```

> Next: [**Event Sourcing**](concepts/event-sourcing.md)

