# Dead Letter Queue

The Dead Letter Queue (DLQ) captures failed events for later analysis and retry. This prevents event loss and enables debugging of failures.

## Why Dead Letter Queues?

Event handlers can fail for many reasons:
- External service unavailable
- Database connection issues
- Business rule violations
- Bugs in handler code

Without a DLQ, failed events are lost. With a DLQ:
- Failed events are preserved
- You can inspect and debug failures
- Events can be retried when issues are resolved
- System remains resilient

## Using DeadLetterAwareEventBus

Replace the standard `EventBus` with `DeadLetterAwareEventBus`:

```typescript
import { EventSourcing } from "hollywood-js";

// Create a dead letter queue
const deadLetterQueue = new EventSourcing.InMemoryDeadLetterQueue();

// Create bus with DLQ support
const eventBus = new EventSourcing.DeadLetterAwareEventBus(deadLetterQueue);

// Attach subscribers as usual
eventBus.attach(UserCreated, userCreatedSubscriber);
eventBus.addListener(auditLogger);
```

## Adding Retry Policies

Configure automatic retries before events go to the DLQ:

```typescript
import { EventSourcing } from "hollywood-js";

const retryPolicy = new EventSourcing.RetryPolicy({
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
});

const eventBus = new EventSourcing.DeadLetterAwareEventBus(
    deadLetterQueue,
    retryPolicy
);
```

With this configuration:
- 1st failure: wait 100ms, retry
- 2nd failure: wait 200ms, retry
- 3rd failure: wait 400ms, retry
- 4th failure: send to DLQ

## Inspecting the DLQ

```typescript
// Get all failed messages
const failedMessages = await deadLetterQueue.list();

for (const message of failedMessages) {
    console.log({
        id: message.id,
        eventType: message.originalMessage.eventType,
        handler: message.handlerName,
        error: message.error.message,
        retryCount: message.retryCount,
        failedAt: message.failedAt,
    });
}

// Get queue size
const count = await deadLetterQueue.size();
```

## Retrying Failed Events

Manually retry a specific failed event:

```typescript
// Get the failed message
const failedMessage = await deadLetterQueue.get(messageId);

// Retry with the original handler
const success = await eventBus.retry(messageId, async (message) => {
    await myHandler.on(message);
});

if (success) {
    console.log("Event processed successfully");
} else {
    console.log("Retry failed, event remains in DLQ");
}
```

## Dead Letter Message Structure

```typescript
interface DeadLetterMessage {
    id: string;                     // Unique message ID
    originalMessage: DomainMessage; // The original event
    error: Error;                   // The error that occurred
    handlerName: string;            // Handler that failed
    retryCount: number;             // Number of retry attempts
    failedAt: Date;                 // When it failed
}
```

## Custom Dead Letter Queue

Implement `IDeadLetterQueue` for production storage:

```typescript
import { EventSourcing } from "hollywood-js";

class PostgresDeadLetterQueue implements EventSourcing.IDeadLetterQueue {
    async add(message: DeadLetterMessage): Promise<void> {
        // Insert into database
    }

    async get(id: string): Promise<DeadLetterMessage | null> {
        // Query by ID
    }

    async update(message: DeadLetterMessage): Promise<void> {
        // Update existing message
    }

    async remove(id: string): Promise<void> {
        // Delete from database
    }

    async list(): Promise<DeadLetterMessage[]> {
        // Return all failed messages
    }

    async size(): Promise<number> {
        // Return count
    }
}
```

## Module Configuration

```typescript
const services = new Map()
    .set("shared.infrastructure.deadLetterQueue", {
        instance: EventSourcing.InMemoryDeadLetterQueue,
    })
    .set("shared.infrastructure.retryPolicy", {
        instance: EventSourcing.RetryPolicy,
        factory: () => new EventSourcing.RetryPolicy({
            maxRetries: 3,
            initialDelayMs: 100,
            maxDelayMs: 5000,
            backoffMultiplier: 2,
        }),
    })
    .set("shared.infrastructure.eventBus.dlqAware", {
        instance: EventSourcing.DeadLetterAwareEventBus,
        deps: [
            "shared.infrastructure.deadLetterQueue",
            "shared.infrastructure.retryPolicy",
        ],
    });
```

## Monitoring

In production, monitor your DLQ:
- Alert when queue size exceeds threshold
- Track failure rates by event type
- Log retry attempts and outcomes

---

**Next:** [Projections & Read Models](projections.md)
