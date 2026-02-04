# Container

Hollywood uses [Inversify](https://github.com/inversify/InversifyJS) for dependency injection. This reference covers service types and configuration.

## Service Types

### Standard Type

Basic class instantiation:

```typescript
const services = new Map()
    .set("logger", { instance: Logger });
```

### Async Type

Asynchronous service initialization:

```typescript
async function createDatabaseConnection() {
    const connection = new PostgresClient(config);
    await connection.connect();
    return connection;
}

const services = new Map()
    .set("database.connection", { async: createDatabaseConnection });
```

### Collection Type

Multiple services under one alias:

```typescript
const services = new Map()
    .set("pricing.strategies", {
        collection: [CouponStrategy, B2BStrategy, BulkStrategy],
    });
```

### Custom Type

Factory function for complex initialization:

```typescript
const services = new Map()
    .set("custom.service", {
        custom: () => createCustomService(config.get("custom.config")),
    });
```

### EventStore Type

Shorthand for EventStore configuration:

```typescript
const services = new Map()
    .set("user.eventStore", { eventStore: User });
```

### Listener Type

Event bus listener configuration:

```typescript
const services = new Map()
    .set("audit.listener", {
        instance: AuditListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true,  // Receives all events
    });
```

### Subscriber Type

Event subscriber configuration:

```typescript
const services = new Map()
    .set("user.created.subscriber", {
        instance: UserCreatedSubscriber,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        subscriber: [UserCreated, UserUpdated],  // Specific events
    });
```

## Built-in Service Aliases

| Alias | Description |
|-------|-------------|
| `hollywood.application.command.handlers` | Command handler registry |
| `hollywood.application.query.handlers` | Query handler registry |
| `hollywood.application.command.middleware` | Command bus middleware |
| `hollywood.application.query.middleware` | Query bus middleware |
| `hollywood.infrastructure.eventBus.default` | Default event bus |
| `hollywood.infrastructure.eventStore.dbal.default` | Default EventStore DBAL |
| `hollywood.infrastructure.eventStore.snapshot.default` | Default snapshot service |
| `hollywood.infrastructure.eventStore.snapshot.dbal.default` | Default snapshot DBAL |

## Injecting Dependencies

Use Inversify decorators:

```typescript
import { inject, injectable } from "inversify";

@injectable()
class CustomerService {
    constructor(
        @inject("customer.repository") private readonly repository: CustomerRepository,
        @inject("logger") private readonly logger: Logger,
        @inject("database.host") private readonly dbHost: string,  // Parameters too
    ) {}
}
```

## Parameters

Parameters are configured in the Kernel:

```typescript
const parameters = new Map([
    ["database.host", process.env.DB_HOST || "localhost"],
    ["database.port", parseInt(process.env.DB_PORT || "5432")],
    ["log.level", process.env.LOG_LEVEL || "info"],
]);

const kernel = await Framework.Kernel.createFromModuleContext(
    "production",
    parameters,
    AppModule
);
```

## Module Dependencies

Modules can depend on other modules:

```typescript
const SharedModule = new Framework.ModuleContext({
    services: new Map()
        .set("logger", { instance: Logger }),
});

const CustomerModule = new Framework.ModuleContext({
    services: new Map()
        .set("customer.repository", { instance: CustomerRepository }),
    modules: [SharedModule],  // Depends on SharedModule
});
```

## Accessing the Container

```typescript
const kernel = await KernelFactory();

// Get a service
const logger = kernel.container.get<Logger>("logger");

// Check if service exists
if (kernel.container.isBound("optional.service")) {
    const service = kernel.container.get("optional.service");
}
```

## Testing

Create isolated modules for testing:

```typescript
const TestModule = new Framework.ModuleContext({
    services: new Map()
        .set("customer.repository", { instance: MockCustomerRepository }),
});

const testKernel = await Framework.Kernel.createFromModuleContext(
    "test",
    new Map(),
    TestModule
);
```

---

**See also:** [Dependency Injection](../basics/dependency-injection.md)
