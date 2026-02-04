# CQRS

Command and Query Responsibility Segregation separates read and write operations for a data store.

## Overview

CQRS splits operations into two channels:
- **Command Bus**: State mutation, returns void
- **Query Bus**: State retrieval, returns data

This separation enables:
- Optimized read and write models
- Better scalability
- Cleaner domain boundaries

## Command Bus

Commands request changes and return nothing.

### ICommand Interface

```typescript
export default interface ICommand {}
```

### ICommandHandler Interface

```typescript
import type { IAppError } from "../CallbackArg";
import type ICommand from "./Command";

export default interface ICommandHandler {
    handle(command: ICommand): Promise<void | IAppError>;
}
```

### Command Example

```typescript
import type { Application } from "hollywood-js";

export default class CreateCustomer implements Application.ICommand {
    constructor(
        public readonly userId: string,
        public readonly username: string,
    ) {}
}
```

### Handler Example

```typescript
import { Application } from "hollywood-js";
import type { IAppError } from "hollywood-js/src/Application/Bus/CallbackArg";
import { injectable } from "inversify";

@injectable()
export default class CreateCustomerHandler implements Application.ICommandHandler {
    constructor(private readonly repository: CustomerRepository) {}

    @Application.autowiring
    public async handle(command: CreateCustomer): Promise<void | IAppError> {
        const customer = new Customer(command.userId, command.username);
        await this.repository.save(customer);
    }
}
```

### Dispatching Commands

```typescript
await kernel.app.handle(new CreateCustomer(uuid, "Valid-Username"));
```

## Query Bus

Queries retrieve data without side effects.

### IQuery Interface

```typescript
export default interface IQuery {}
```

### IQueryHandler Interface

```typescript
export default interface IQueryHandler {
    handle(query: IQuery): Promise<IAppResponse | IAppError>;
}
```

### Query Example

```typescript
import type { Application } from "hollywood-js";

export default class GetCustomerById implements Application.IQuery {
    constructor(public readonly userId: string) {}
}
```

### Handler Example

```typescript
import { Application } from "hollywood-js";
import { injectable } from "inversify";

@injectable()
export default class GetCustomerByIdHandler implements Application.IQueryHandler {
    constructor(private readonly repository: CustomerReadModelRepository) {}

    @Application.autowiring
    public async handle(query: GetCustomerById): Promise<Application.IAppResponse | Application.IAppError> {
        const customer = await this.repository.findById(query.userId);

        return {
            data: customer,
            meta: [],
        };
    }
}
```

### Executing Queries

```typescript
const result = await kernel.app.ask(new GetCustomerById(uuid));
console.log(result.data);
```

## Module Registration

```typescript
import { Framework } from "hollywood-js";

export const CustomerModule = new Framework.ModuleContext({
    commands: [CreateCustomerHandler],
    queries: [GetCustomerByIdHandler],
    services: new Map()
        .set("customer.repository", { instance: CustomerRepository })
        .set("customer.readModel.repository", { instance: CustomerReadModelRepository }),
});
```

## Middleware Support

Both buses support middleware for cross-cutting concerns:

```typescript
const services = new Map()
    .set("hollywood.application.command.middleware", {
        collection: [LoggingMiddleware, ValidationMiddleware],
    })
    .set("hollywood.application.query.middleware", {
        collection: [CachingMiddleware],
    });
```

---

**See also:** [Commands](../basics/commands.md) | [Queries](../basics/queries.md)
