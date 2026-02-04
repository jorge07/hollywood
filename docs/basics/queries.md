# Queries & Handlers

Queries retrieve data without modifying state. They're the read side of CQRS.

## What is a Query?

In CQRS, queries:
- Request data from the application
- Never modify state
- Return data via `IAppResponse`

## Creating a Query

Queries implement the `IQuery` marker interface:

```typescript
// src/modules/customer/application/query/get-by-id/query.ts
import type { Application } from "hollywood-js";

export default class GetCustomerById implements Application.IQuery {
    constructor(public readonly userId: string) {}
}
```

## Creating a Query Handler

Handlers implement `IQueryHandler` and return `IAppResponse`:

```typescript
// src/modules/customer/application/query/get-by-id/handler.ts
import { Application } from "hollywood-js";
import { injectable, inject } from "inversify";
import GetCustomerById from "./query";

@injectable()
export default class GetCustomerByIdHandler implements Application.IQueryHandler {
    constructor(
        @inject("customer.readModel.repository")
        private readonly repository: CustomerReadModelRepository
    ) {}

    @Application.autowiring
    public async handle(query: GetCustomerById): Promise<Application.IAppResponse | Application.IAppError> {
        const customer = await this.repository.findById(query.userId);

        if (!customer) {
            return { error: new Error("Customer not found") };
        }

        return {
            data: customer,
            meta: [],
        };
    }
}
```

## Registering Query Handlers

Add handlers to your module's `queries` array:

```typescript
// src/modules/customer/infrastructure/customer-module.ts
import { Framework } from "hollywood-js";
import GetCustomerByIdHandler from "../application/query/get-by-id/handler";

export const CustomerModule = new Framework.ModuleContext({
    commands: [...],
    queries: [
        GetCustomerByIdHandler,
    ],
    services: new Map()
        .set("customer.readModel.repository", { instance: InMemoryReadModelRepository }),
});
```

## Executing Queries

Use `kernel.app.ask()` to execute queries:

```typescript
import GetCustomerById from "./src/modules/customer/application/query/get-by-id/query";
import KernelFactory from "./src/kernel";

(async () => {
    const kernel = await KernelFactory();

    const result = await kernel.app.ask(new GetCustomerById("uuid-123"));
    console.log(result.data);  // Customer data
})();
```

## Response Format

Queries return `IAppResponse` with data and optional metadata:

```typescript
interface IAppResponse<T = unknown> {
    data: T;
    meta: any[];
}
```

Use metadata for pagination, counts, or other auxiliary information:

```typescript
@Application.autowiring
public async handle(query: ListCustomers): Promise<Application.IAppResponse> {
    const customers = await this.repository.findAll(query.page, query.limit);
    const total = await this.repository.count();

    return {
        data: customers,
        meta: [
            { page: query.page },
            { limit: query.limit },
            { total },
        ],
    };
}
```

## Query vs Command Summary

| Aspect | Command | Query |
|--------|---------|-------|
| Purpose | Change state | Read state |
| Return | `void` | `IAppResponse` |
| Dispatch | `kernel.app.handle()` | `kernel.app.ask()` |
| Side effects | Yes | No |

---

**Next:** [Events & Listeners](events.md)
