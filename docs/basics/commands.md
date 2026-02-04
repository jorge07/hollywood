# Commands & Handlers

Commands represent intent to change state. They're handled by command handlers and return nothing.

## What is a Command?

In CQRS, commands:
- Request changes to application state
- Return `void` (no data)
- Are handled by exactly one handler

## Creating a Command

Commands implement the `ICommand` marker interface:

```typescript
// src/modules/customer/application/command/create/command.ts
import type { Application } from "hollywood-js";

export default class CreateCustomer implements Application.ICommand {
    constructor(
        public readonly userId: string,
        public readonly username: string,
    ) {}
}
```

## Creating a Command Handler

Handlers implement `ICommandHandler` and use the `@autowiring` decorator:

```typescript
// src/modules/customer/application/command/create/handler.ts
import { Application } from "hollywood-js";
import type { IAppError } from "hollywood-js/src/Application/Bus/CallbackArg";
import { inject, injectable } from "inversify";
import CreateCustomer from "./command";
import { Customer } from "../../../domain/customer";
import { CustomerRepository } from "../../../domain/repository";

@injectable()
export default class CreateCustomerHandler implements Application.ICommandHandler {
    constructor(
        @inject("customer.repository")
        private readonly repository: CustomerRepository
    ) {}

    @Application.autowiring
    public async handle(command: CreateCustomer): Promise<void | IAppError> {
        const customer = new Customer(command.userId, command.username);
        await this.repository.save(customer);
    }
}
```

The `@Application.autowiring` decorator maps the handler to its command type automatically.

## Registering Command Handlers

Add handlers to your module's `commands` array:

```typescript
// src/modules/customer/infrastructure/customer-module.ts
import { Framework } from "hollywood-js";
import CreateCustomerHandler from "../application/command/create/handler";

export const CustomerModule = new Framework.ModuleContext({
    commands: [
        CreateCustomerHandler,
    ],
    services: new Map()
        .set("customer.repository", { instance: InMemoryRepository }),
});
```

## Dispatching Commands

Use `kernel.app.handle()` to dispatch commands:

```typescript
import CreateCustomer from "./src/modules/customer/application/command/create/command";
import KernelFactory from "./src/kernel";

(async () => {
    const kernel = await KernelFactory();

    await kernel.app.handle(new CreateCustomer("uuid-123", "john_doe"));
    // Command executed, no return value
})();
```

## Validating Commands

Validate input in the command constructor for early failure:

```typescript
import { Application } from "hollywood-js";
import { Username } from "../../../domain/value-object/username";

export default class CreateCustomer implements Application.ICommand {
    public readonly username: Username;  // Validated value object

    constructor(
        public readonly userId: string,
        username: string,
    ) {
        // Validation happens here - fails fast if invalid
        this.username = Username.fromLiteral(username);
    }
}
```

## Error Handling

Return `IAppError` from handlers for domain errors:

```typescript
@Application.autowiring
public async handle(command: CreateCustomer): Promise<void | IAppError> {
    const exists = await this.repository.exists(command.userId);
    if (exists) {
        return { error: new Error("Customer already exists") };
    }

    const customer = new Customer(command.userId, command.username);
    await this.repository.save(customer);
}
```

---

**Next:** [Queries & Handlers](queries.md)
