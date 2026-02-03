# Command & Query Handling (CQRS)

## Overview

Hollywood-JS implements CQRS through separate command and query buses:

- **Commands**: Write operations that mutate state
- **Queries**: Read operations that return data

**Source files:**

- `src/Application/App.ts`
- `src/Application/Bus/Command/CommandBus.ts`
- `src/Application/Bus/Query/QueryBus.ts`
- `src/Application/Bus/Middleware.ts`

## Commands

### Step 1: Define the Command

Commands are simple data classes implementing `ICommand`:

```typescript
import type { Application } from "hollywood-js";

class CreateOrderCommand implements Application.ICommand {
    constructor(
        public readonly orderId: string,
        public readonly customerId: string,
        public readonly items: Array<{ itemId: string; quantity: number }>
    ) {}
}
```

### Step 2: Create the Handler

Handlers must:

1. Be decorated with `@injectable()`
2. Use `@Application.autowiring` on the `handle` method
3. Implement `ICommandHandler`

```typescript
import { Application } from "hollywood-js";
import { injectable, inject } from "inversify";
import type { IAppError } from "hollywood-js/src/Application/Bus/CallbackArg";

@injectable()
class CreateOrderHandler implements Application.ICommandHandler {
    constructor(
        @inject("order.repository") private readonly repository: OrderRepository
    ) {}

    @Application.autowiring
    async handle(command: CreateOrderCommand): Promise<void | IAppError> {
        // Create aggregate
        const order = Order.create(command.orderId, command.customerId);

        // Apply business logic
        for (const item of command.items) {
            order.addItem(item.itemId, item.quantity, 100); // price lookup omitted
        }

        // Persist
        await this.repository.save(order);
    }
}
```

### Step 3: Execute the Command

```typescript
const kernel = await Framework.Kernel.createFromModuleContext(/* ... */);

await kernel.app.handle(new CreateOrderCommand(
    "order-123",
    "customer-456",
    [{ itemId: "item-1", quantity: 2 }]
));
```

## Queries

### Step 1: Define the Query

```typescript
import type { Application } from "hollywood-js";

class GetOrderQuery implements Application.IQuery {
    constructor(public readonly orderId: string) {}
}
```

### Step 2: Create the Query Handler

Query handlers return `IAppResponse` or `IAppError`:

```typescript
import { Application } from "hollywood-js";
import { injectable, inject } from "inversify";
import type { IAppResponse, IAppError } from "hollywood-js/src/Application/Bus/CallbackArg";

// Define response shape
interface OrderDTO {
    orderId: string;
    customerId: string;
    total: number;
    status: string;
}

@injectable()
class GetOrderHandler implements Application.IQueryHandler {
    constructor(
        @inject("order.readModel") private readonly readModel: OrderReadModel
    ) {}

    @Application.autowiring
    async handle(query: GetOrderQuery): Promise<IAppResponse<OrderDTO> | IAppError> {
        const order = await this.readModel.findById(query.orderId);

        if (!order) {
            return {
                code: 404,
                message: "Order not found"
            };
        }

        return {
            data: order,
            meta: []
        };
    }
}
```

### Step 3: Execute the Query

```typescript
const result = await kernel.app.ask(new GetOrderQuery("order-123"));

if ("code" in result && result.code) {
    // Handle error
    console.error(result.message);
} else if (result) {
    // Handle success
    console.log(result.data);
}
```

## Response Types

### Successful Response

```typescript
interface IAppResponse<TData = unknown, TMeta = unknown> {
    data: TData;
    meta: TMeta[];
}
```

### Error Response

```typescript
interface IAppError {
    message: string;
    code: number;
    data?: unknown;  // Optional partial data
    meta?: unknown[];
}
```

### Query Bus Response

```typescript
type QueryBusResponse<TData, TMeta> = IAppResponse<TData, TMeta> | IAppError | null;
```

## Middleware Pipeline

Middleware intercepts commands/queries before they reach handlers.

### Creating Middleware

```typescript
import type IMiddleware from "hollywood-js/src/Application/Bus/Middleware";
import type { NextMiddleware } from "hollywood-js/src/Application/Bus/Middleware";
import type ICommand from "hollywood-js/src/Application/Bus/Command/Command";

class LoggingMiddleware implements IMiddleware<ICommand, void> {
    constructor(private readonly logger: Logger) {}

    async execute(
        command: ICommand,
        next: NextMiddleware<ICommand, void>
    ): Promise<void> {
        const commandName = command.constructor.name;

        this.logger.info(`Executing command: ${commandName}`);
        const startTime = Date.now();

        try {
            const result = await next(command);
            this.logger.info(`Command ${commandName} completed in ${Date.now() - startTime}ms`);
            return result;
        } catch (error) {
            this.logger.error(`Command ${commandName} failed: ${error}`);
            throw error;
        }
    }
}
```

### Typed Middleware

For type-safe middleware, use the exported types:

```typescript
import type { CommandMiddleware, QueryMiddleware } from "hollywood-js/src/Application/App";

// Command middleware
const commandMiddleware: CommandMiddleware = {
    async execute(command, next) {
        // Pre-processing
        const result = await next(command);
        // Post-processing
        return result;
    }
};

// Query middleware
const queryMiddleware: QueryMiddleware = {
    async execute(query, next) {
        const result = await next(query);
        return result;
    }
};
```

### Registering Middleware

Middleware is registered via service configuration:

```typescript
import { Framework } from "hollywood-js";

const services = new Map([
    // Command middleware
    [
        "hollywood.application.command.middleware",
        { collection: [LoggingMiddleware, ValidationMiddleware] }
    ],
    // Query middleware
    [
        "hollywood.application.query.middleware",
        { collection: [CachingMiddleware] }
    ]
]);

const AppModule = new Framework.ModuleContext({
    commands: [CreateOrderHandler],
    queries: [GetOrderHandler],
    services
});
```

### Middleware Execution Order

Middlewares execute in array order, with the resolver always last:

```text
Request -> Middleware1 -> Middleware2 -> ... -> Resolver -> Handler
                                                    |
Response <- Middleware1 <- Middleware2 <- ... <----+
```

## The Autowiring Decorator

The `@Application.autowiring` decorator:

1. Extracts the command/query type from the handler method signature
2. Registers the mapping for the resolver

```typescript
@Application.autowiring
async handle(command: CreateOrderCommand): Promise<void> {
    // The decorator reads 'CreateOrderCommand' from the parameter type
    // and registers: CreateOrderCommand -> CreateOrderHandler
}
```

**Important:** The decorator uses TypeScript's reflection metadata. Ensure your `tsconfig.json` has:

```json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

## Complete Module Example

```typescript
import "reflect-metadata";
import { Framework, Application } from "hollywood-js";
import { injectable, inject } from "inversify";

// Command
class CreateUserCommand implements Application.ICommand {
    constructor(
        public readonly userId: string,
        public readonly email: string
    ) {}
}

// Query
class GetUserQuery implements Application.IQuery {
    constructor(public readonly userId: string) {}
}

// Command Handler
@injectable()
class CreateUserHandler implements Application.ICommandHandler {
    constructor(@inject("user.repository") private readonly repo: UserRepository) {}

    @Application.autowiring
    async handle(command: CreateUserCommand): Promise<void> {
        await this.repo.save({ id: command.userId, email: command.email });
    }
}

// Query Handler
@injectable()
class GetUserHandler implements Application.IQueryHandler {
    constructor(@inject("user.readModel") private readonly readModel: UserReadModel) {}

    @Application.autowiring
    async handle(query: GetUserQuery): Promise<IAppResponse | IAppError> {
        const user = await this.readModel.findById(query.userId);
        if (!user) {
            return { code: 404, message: "User not found" };
        }
        return { data: user, meta: [] };
    }
}

// Module Configuration
const UserModule = new Framework.ModuleContext({
    commands: [CreateUserHandler],
    queries: [GetUserHandler],
    services: new Map([
        ["user.repository", { instance: InMemoryUserRepository }],
        ["user.readModel", { instance: InMemoryUserReadModel }]
    ])
});

// Usage
async function main() {
    const kernel = await Framework.Kernel.createFromModuleContext(
        "dev",
        new Map(),
        UserModule
    );

    // Execute command
    await kernel.app.handle(new CreateUserCommand("user-1", "user@example.com"));

    // Execute query
    const result = await kernel.app.ask(new GetUserQuery("user-1"));
    console.log(result);
}
```

## Service Aliases

Hollywood-JS uses predefined aliases for bus components:

```typescript
// From src/Framework/Container/Bridge/Alias.ts
const SERVICES_ALIAS = {
    COMMAND_HANDLERS: "hollywood.application.command.handlers",
    QUERY_HANDLERS: "hollywood.application.query.handlers",
    COMMAND_MIDDLEWARE: "hollywood.application.command.middleware",
    QUERY_MIDDLEWARE: "hollywood.application.query.middleware",
    // ... event bus aliases
};
```

## Related Documentation

- [Creating Aggregates](./creating-aggregates.md) - Domain objects for command handlers
- [Event Listeners](./event-listeners.md) - Side effects after commands
- [Module Setup](./module-setup.md) - Full module configuration
