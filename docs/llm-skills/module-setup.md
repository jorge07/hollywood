# Module Setup and Dependency Injection

## Overview

Hollywood-JS uses Inversify for dependency injection with a module-based architecture:

- **Kernel**: Application entry point and DI container
- **ModuleContext**: Bounded context configuration
- **Services**: Injectable dependencies

**Source files:**

- `src/Framework/Kernel.ts`
- `src/Framework/Modules/ModuleContext.ts`
- `src/Framework/Container/Items/Service.ts`
- `src/Framework/Container/Bridge/Alias.ts`

## Kernel Bootstrap

The Kernel is the application root:

```typescript
import "reflect-metadata";
import { Framework } from "hollywood-js";

const kernel = await Framework.Kernel.createFromModuleContext(
    "dev",                    // Environment: 'dev', 'test', 'prod'
    parameters,               // Configuration parameters
    mainModule,               // Root ModuleContext
    testParameters            // Optional: overrides for 'test' env
);

// Access the DI container
const service = kernel.container.get<MyService>("my.service");

// Access the application (command/query buses)
await kernel.app.handle(new MyCommand());
const result = await kernel.app.ask(new MyQuery());
```

## ModuleContext Configuration

### Basic Module

```typescript
import { Framework } from "hollywood-js";

const UserModule = new Framework.ModuleContext({
    commands: [CreateUserHandler, UpdateUserHandler],
    queries: [GetUserHandler, ListUsersHandler],
    services: new Map([
        ["user.repository", { instance: UserRepository }],
        ["user.readModel", { instance: UserReadModel }]
    ])
});
```

### Module with Dependencies

Modules can depend on other modules:

```typescript
// Shared module
const SharedModule = new Framework.ModuleContext({
    services: new Map([
        ["logger", { instance: ConsoleLogger }],
        ["config", { instance: AppConfig }]
    ])
});

// User module depends on shared
const UserModule = new Framework.ModuleContext({
    commands: [CreateUserHandler],
    services: new Map([
        ["user.repository", { instance: UserRepository }]
    ]),
    modules: [SharedModule]  // Dependency
});

// Order module depends on shared and user
const OrderModule = new Framework.ModuleContext({
    commands: [CreateOrderHandler],
    services: new Map([
        ["order.repository", { instance: OrderRepository }]
    ]),
    modules: [SharedModule, UserModule]
});
```

## Service Registration Types

### Standard Instance

Singleton service instantiated by the container:

```typescript
services: new Map([
    ["user.repository", { instance: UserRepository }]
])
```

### Collection

Multiple implementations bound to the same identifier:

```typescript
services: new Map([
    ["validators", { collection: [EmailValidator, PhoneValidator] }]
])

// Retrieve all
const validators = kernel.container.getAll<Validator>("validators");
```

### Custom Factory

Dynamic value creation with container access:

```typescript
services: new Map([
    [
        "database.connection",
        {
            custom: (context) => {
                const config = context.container.get<Config>("config");
                return new DatabaseConnection(config.dbUrl);
            }
        }
    ]
])
```

### Async Factory

For services requiring async initialization:

```typescript
services: new Map([
    [
        "database.pool",
        {
            async: async () => {
                const pool = new Pool();
                await pool.connect();
                return pool;
            }
        }
    ]
])
```

### EventStore

Automatic EventStore configuration for aggregates:

```typescript
services: new Map([
    [
        "order.eventStore",
        { eventStore: Order }  // Pass the aggregate class
    ]
])
```

This automatically injects:

- Event store DBAL
- Event bus
- Snapshot store DBAL
- Snapshot margin

### Constant Value

Bind a constant value:

```typescript
services: new Map([
    ["app.version", { custom: () => "1.0.0", constant: true }]
])
```

### Overwrite Existing

Replace a service (useful in test environments):

```typescript
services: new Map([
    [
        "user.repository",
        {
            instance: MockUserRepository,
            overwrite: true  // Replaces existing binding
        }
    ]
])
```

## Event Bus Configuration

### Subscriber Registration

```typescript
services: new Map([
    [
        "order.projector",
        {
            instance: OrderProjector,
            bus: "hollywood.infrastructure.eventBus.default",
            subscriber: [OrderCreated, OrderShipped]
        }
    ]
])
```

### Listener Registration

```typescript
services: new Map([
    [
        "audit.logger",
        {
            instance: AuditLogger,
            bus: "hollywood.infrastructure.eventBus.default",
            listener: true
        }
    ]
])
```

## Parameters

Configuration values injected into services:

```typescript
// Define parameters
const parameters = new Map([
    ["db.host", "localhost"],
    ["db.port", 5432],
    ["cache.ttl", 3600]
]);

// Use in service
@injectable()
class DatabaseConnection {
    constructor(
        @inject("db.host") private readonly host: string,
        @inject("db.port") private readonly port: number
    ) {}
}

// Create kernel
const kernel = await Framework.Kernel.createFromModuleContext(
    "dev",
    parameters,
    AppModule
);
```

### Test Parameter Overrides

Override parameters in test environment:

```typescript
const prodParameters = new Map([
    ["api.url", "https://api.production.com"]
]);

const testParameters = new Map([
    ["api.url", "http://localhost:3000"]  // Test override
]);

const kernel = await Framework.Kernel.createFromModuleContext(
    "test",           // When env is 'test'
    prodParameters,
    AppModule,
    testParameters    // These override prodParameters
);

// api.url will be "http://localhost:3000" in test
```

## Built-in Service Aliases

Hollywood-JS reserves these service identifiers:

```typescript
// From src/Framework/Container/Bridge/Alias.ts
const SERVICES_ALIAS = {
    // Command/Query handlers (auto-populated from ModuleContext)
    COMMAND_HANDLERS: "hollywood.application.command.handlers",
    QUERY_HANDLERS: "hollywood.application.query.handlers",

    // Middleware
    COMMAND_MIDDLEWARE: "hollywood.application.command.middleware",
    QUERY_MIDDLEWARE: "hollywood.application.query.middleware",

    // Event infrastructure
    DEFAULT_EVENT_BUS: "hollywood.infrastructure.eventBus.default",
    DEFAULT_EVENT_STORE_DBAL: "hollywood.infrastructure.eventStore.dbal.default",
    DEFAULT_EVENT_STORE_SNAPSHOT: "hollywood.infrastructure.eventStore.snapshot.default",
    DEFAULT_EVENT_STORE_SNAPSHOT_DBAL: "hollywood.infrastructure.eventStore.snapshot.dbal.default"
};

const PARAMETERS_ALIAS = {
    DEFAULT_EVENT_STORE_MARGIN: "hollywood.eventStore.default.margin"
};
```

## Complete Application Example

```typescript
import "reflect-metadata";
import { Framework, Application, EventSourcing, ReadModel, Domain } from "hollywood-js";
import { injectable, inject } from "inversify";

// ============ DOMAIN ============

class UserCreated implements Domain.DomainEvent {
    constructor(public readonly userId: string, public readonly email: string) {}
}

class User extends Domain.EventSourcedAggregateRoot {
    private email: string = "";

    constructor(id: string) {
        super(id);
        this.registerHandler(UserCreated, (e) => { this.email = e.email; });
    }

    static create(id: string, email: string): User {
        const user = new User(id);
        user.raise(new UserCreated(id, email));
        return user;
    }
}

class UserRepository extends Domain.Repository<User> {
    constructor(eventStore: EventSourcing.EventStore<User>) {
        super(eventStore);
    }
}

// ============ APPLICATION ============

class CreateUserCommand implements Application.ICommand {
    constructor(public readonly userId: string, public readonly email: string) {}
}

class GetUserQuery implements Application.IQuery {
    constructor(public readonly userId: string) {}
}

@injectable()
class CreateUserHandler implements Application.ICommandHandler {
    constructor(@inject("user.repository") private readonly repo: UserRepository) {}

    @Application.autowiring
    async handle(cmd: CreateUserCommand): Promise<void> {
        const user = User.create(cmd.userId, cmd.email);
        await this.repo.save(user);
    }
}

@injectable()
class GetUserHandler implements Application.IQueryHandler {
    constructor(@inject("user.readModel") private readonly readModel: ReadModel.InMemoryReadModelRepository) {}

    @Application.autowiring
    async handle(query: GetUserQuery) {
        try {
            return { data: this.readModel.oneOrFail(query.userId), meta: [] };
        } catch {
            return { code: 404, message: "User not found" };
        }
    }
}

// ============ PROJECTOR ============

@injectable()
class UserProjector extends EventSourcing.EventSubscriber {
    constructor(@inject("user.readModel") private readonly readModel: ReadModel.InMemoryReadModelRepository) {
        super();
        this.registerHandler(UserCreated, (e) => {
            this.readModel.save(e.userId, { id: e.userId, email: e.email });
        });
    }
}

// ============ INFRASTRUCTURE MODULE ============

const InfrastructureModule = new Framework.ModuleContext({
    services: new Map([
        ["hollywood.infrastructure.eventBus.default", { instance: EventSourcing.EventBus }],
        ["hollywood.infrastructure.eventStore.dbal.default", { instance: EventSourcing.InMemoryEventStore }],
        ["hollywood.infrastructure.eventStore.snapshot.dbal.default", { instance: EventSourcing.InMemorySnapshotStoreDBAL }],
        ["hollywood.eventStore.default.margin", { custom: () => 10, constant: true }]
    ])
});

// ============ USER MODULE ============

const UserModule = new Framework.ModuleContext({
    commands: [CreateUserHandler],
    queries: [GetUserHandler],
    services: new Map([
        ["user.eventStore", { eventStore: User }],
        [
            "user.repository",
            {
                custom: (ctx) => new UserRepository(ctx.container.get("user.eventStore"))
            }
        ],
        ["user.readModel", { instance: ReadModel.InMemoryReadModelRepository }],
        [
            "user.projector",
            {
                instance: UserProjector,
                bus: "hollywood.infrastructure.eventBus.default",
                subscriber: [UserCreated]
            }
        ]
    ]),
    modules: [InfrastructureModule]
});

// ============ BOOTSTRAP ============

async function main() {
    const kernel = await Framework.Kernel.createFromModuleContext(
        process.env.NODE_ENV || "dev",
        new Map(),
        UserModule
    );

    // Create user
    await kernel.app.handle(new CreateUserCommand("user-1", "user@example.com"));

    // Query user
    const result = await kernel.app.ask(new GetUserQuery("user-1"));
    console.log(result); // { data: { id: 'user-1', email: 'user@example.com' }, meta: [] }
}

main();
```

## IService Interface Reference

```typescript
interface IService {
    // Singleton class instance
    instance?: Constructor;

    // Multiple classes bound to same identifier
    collection?: Constructor[];

    // Factory function with container access
    custom?: (context: interfaces.Context) => unknown;

    // Async factory function
    async?: () => Promise<unknown>;

    // EventStore aggregate factory
    eventStore?: AggregateFactory<EventSourcedAggregateRoot>;

    // Bind as constant value
    constant?: boolean;

    // Replace existing binding
    overwrite?: boolean;

    // Event bus configuration
    bus?: string;
    listener?: boolean;
    subscriber?: Constructor[];
}
```

## Related Documentation

- [Hollywood Overview](./hollywood-overview.md) - Architecture concepts
- [Creating Aggregates](./creating-aggregates.md) - EventStore configuration
- [Command & Query Handling](./command-query-handling.md) - Handler registration
- [Event Listeners](./event-listeners.md) - Subscriber/listener configuration
