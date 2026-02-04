# Events & Listeners

Events enable loose coupling between modules. Hollywood provides an EventBus with subscribers and listeners.

## What Are Events?

Events represent something that happened in your domain. They:
- Are immutable records of past actions
- Enable communication between bounded contexts
- Support multiple subscribers

## Creating Events

Events extend `DomainEvent`:

```typescript
import { Domain } from "hollywood-js";

export class CustomerWasCreated extends Domain.DomainEvent {
    constructor(
        public readonly uuid: string,
        public readonly username: string
    ) {
        super();
    }
}
```

## Publishing Events

Inject the EventBus and publish events wrapped in a `DomainMessage`:

```typescript
import { inject } from "inversify";
import { EventSourcing, Domain } from "hollywood-js";
import { SERVICES_ALIAS } from "hollywood-js/src/Framework/Container/Bridge/Alias";

class CreateCustomerHandler {
    constructor(
        @inject(SERVICES_ALIAS.DEFAULT_EVENT_BUS)
        private readonly eventBus: EventSourcing.EventBus
    ) {}

    async handle(command: CreateCustomer): Promise<void> {
        // Create customer...

        const event = new CustomerWasCreated(command.uuid, command.username);
        await this.eventBus.publish(Domain.DomainMessage.create(event));
    }
}
```

## Subscribers

Subscribers listen to specific event types:

```typescript
import { EventSourcing, Domain } from "hollywood-js";

class WelcomeEmailSubscriber extends EventSourcing.EventListener {
    constructor(private readonly mailer: Mailer) {
        super();
    }

    public async on(message: Domain.DomainMessage): Promise<void> {
        const event = message.event as CustomerWasCreated;
        await this.mailer.sendWelcome(event.uuid, event.username);
    }
}
```

Register subscribers with specific events:

```typescript
const services = new Map()
    .set("customer.welcome.subscriber", {
        instance: WelcomeEmailSubscriber,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        subscriber: [CustomerWasCreated],  // Events to subscribe to
    });
```

## Listeners

Listeners receive all events on an EventBus (useful for logging/auditing):

```typescript
class AuditLogger extends EventSourcing.EventListener {
    public async on(message: Domain.DomainMessage): Promise<void> {
        console.log("Event:", message.eventType, message.uuid);
    }
}

const services = new Map()
    .set("audit.logger", {
        instance: AuditLogger,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true,  // Receives ALL events
    });
```

## Custom Event Buses

Create custom buses for different workflows (e.g., async processing):

```typescript
import { EventSourcing } from "hollywood-js";

const services = new Map()
    .set("eventBus.async.highPriority", {
        instance: EventSourcing.EventBus,
    })
    .set("highPriority.subscriber", {
        instance: HighPriorityHandler,
        bus: "eventBus.async.highPriority",  // Attach to custom bus
        subscriber: [ImportantEvent],
    });
```

## Async Event Processing

For message queues (RabbitMQ, etc.), create a publisher and consumer:

```typescript
// Publisher sends to queue
class RabbitMQPublisher {
    async publish(message: Domain.DomainMessage): Promise<void> {
        await this.channel.publish("events", "", message);
    }
}

// Consumer receives from queue and publishes to local EventBus
class RabbitMQConsumer {
    constructor(
        @inject("eventBus.async.highPriority")
        private readonly eventBus: EventSourcing.EventBus
    ) {}

    async consume(): Promise<void> {
        await this.channel.consume("high-priority", async (msg) => {
            const domainMessage = JSON.parse(msg.content.toString());
            await this.eventBus.publish(domainMessage);
        });
    }
}
```

## Module Configuration Example

```typescript
const services = new Map()
    // Default event bus subscriber
    .set("customer.created.subscriber", {
        instance: CustomerCreatedSubscriber,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        subscriber: [CustomerWasCreated],
    })
    // Audit listener (all events)
    .set("audit.listener", {
        instance: AuditListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true,
    });

export const CustomerModule = new Framework.ModuleContext({
    services,
    commands: [CreateCustomerHandler],
});
```

---

**Next:** [Dependency Injection](dependency-injection.md)
