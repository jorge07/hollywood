# Firing and Listening events

Hollywood provides **ModuleContext** as a way to define Boundaries. Those may have different levels of nested dependencies. 
**Events** are the best way to keep things isolated and share a contract between different Bounded Contexts.

Hollywood provides an **EventBus** with **Listeners** and **Subscribers** to attach some services to 1:N events.

## Events

In Hollywood events needs to extend **DomainEvent**. It helps to extract some metadata:
```typescript
import { Domain } from "hollywood-js";

export class CustomerWasCreated extends Domain.DomainEvent {
    constructor(public uuid: string, public username: string){
        super();
    }
}
```

This event can be published to the **EventBus**. To do so, inject **hollywood.infrastructure.eventBus.default** where you need it and pass your event to the **publish** method after wrap it into a **DomainMessage**.
You can create and configure your own **EventBus** 

## Subscribers

Subscribers are a type Service that binds to particular event/s. Those services will receive a **DomainMessage** whenever the event is subscribed is published.

```typescript
class WelcomeCustomerListener extends EventListener {
    private readonly mailer: Mailer;
    public async on(message: DomainMessage): Promise<void> {
        this.mailer.sendWelcome(message.event);
    }
}

const services = (new Map())
    .set("mailer.customer.welcome", {
        instance: WelcomeCustomerListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        subscriber: [
            CustomerWasCreated
        ]
    })
;
```

## Listeners

Listeners are a type of Service that will receive a **DomainMessage**  **whenever** an event is published into the **EventBus** the Listener is attached to. 

```typescript
class EventAuditStoreElasticSearchListener extends EventListener {
    private readonly elasticCli: ElasticClient;
    public async on(message: DomainMessage): Promise<void> {
        this.elasticClient.append(message);
    }
}

const services = (new Map())
    .set("event.audit.elasticsearch", {
        instance: EventAuditStoreElasticSearchListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listeners: true
    })
;
```

## Custom Event Bus

> I'll not write the full implementation but leave this repository as example: [Billing-API](https://github.com/jorge07/billing-api)

Some times you may need a custom **EventBus**. For example: 

- We want to send **DomainEvents** to a **high_priority** queue to be processed asynchronously.

Let's create a new **Async EventBus**:

```typescript
import { EventSourcing } from "hollywood-js";

const services = (new Map())
    .set("shared.infrastructure.eventBus.async.highPriority", { 
        instance: EventSourcing.EventBus 
    })
;
```
This one will be executed from a RabbitMQ consumer so all the events we send to the **high_priority** queue will be executed asynchronously.


Let's imagine we use **RabbitMQ**:
- To send things to a queue we need a **Publisher that send messages to an exchange that will end in a queue**: `RabbitMQEventPublisher`
- To retrieve messages from a queue we'll need a **Consumer**: `RabbitMQHighPriorityConsumer`


```typescript
import { EventSourcing } from "hollywood-js";

const services = (new Map())
    .set("shared.infrastructure.eventBus.async.highPriority.eventPublisher", {
        instance: RabbitMQEventPublisher,
    })
    .set("shared.infrastructure.eventBus.async.highPriority.consumer", {
        instance: RabbitMQHighPriorityConsumer,
    })
;
```

With this new **EventBus** defined we can inject it into whenever we want:

```typescript
import {inject} from "inversify";
import {EventSourcing} from "hollywood-js";
import DomainMessage from "./DomainMessage";

class RememberPasswordHandler {
    constructor(
        @inject("shared.infrastructure.eventBus.async.eventPublisher")
        private readonly highPriorityBus: EventSourcing.EventBus) {
    }

    async handle(command: RememberPasswordCommand): Promise<void> {
        await this.highPriorityBus.publish(PasswordWasForgotten.fromMessge(command))
    }
}
```

The **RabbitMQHighPriorityConsumer** will be something like:

```typescript
class RabbitMQHighPriorityConsumer {

    constructor(
        private readonly connection: RMQConnection,
        private readonly channel: RMQChannel,
        @inject("shared.infrastructure.eventBus.async.highPriority") private readonly eventBus: EventBus,
    ) {}

    public async consume(
        exchange: string = "events",
        queue: string = "high-priority",
        pattern: string = "#",
    ) {
        await this.channel.assertQueue(queue, {exclusive: false});
        await this.channel.bindQueue(queue, exchange, pattern);
        await this.amqpChannel.consume(exchange, queue, pattern, async (message: Message | null) => {
            if (!message) return;
            const domainMessage = (JSON.parse(message.content.toString()) as Domain.DomainMessage);
            await this.eventBus.publish(domainMessage);
        });
    }
}
```

We bind the mailer Subscriber:

```typescript
const services = (new Map())
    .set("mailer.customer.rememberPassword", {
        bus: "shared.infrastructure.eventBus.async.highPriority",
        instance: RememberPassword,
        subscriber: [
            PasswordWasForgotten,
        ],
    })
```

Build the CLI:

```typescript
import "reflect-metadata";
import { program } from "commander";
...

program
  .version("1.0.0")
;

program
    .command("queue:consume:high-priority")
    .description("Consume high-priority queue")
    .action(async (options) => {
        const kernel = await KernelFactory()
        const asyncEventBus = kernel.container.get<EventBud>(
            'shared.infrastructure.eventBus.async.highPriority.consumer'
        );
        await bus.consume();
    })
;
```

Done.

# Help?

> This topics can be complex. Need help? Open an issue [here](https://github.com/jorge07/hollywood/issues/new/choose)
