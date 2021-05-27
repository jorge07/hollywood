# CQRS

> CQRS stands for Command and Query Responsibility Segregation, a pattern that separates read and update operations for a data store. Implementing CQRS in your application can maximize its performance, scalability, and security. The flexibility created by migrating to CQRS allows a system to better evolve over time and prevents update commands from causing merge conflicts at the domain level.

Hollywood is built around the CQRS pattern and provides two different channels to interact with the Kernel.

Use Cases will be defined as Commands or Queries depending on of the needs:

- **Command Bus**: State mutation, return void.
- **Query Bus**: State query, return unknown.

# Command Bus

In CQRS *Commands* requests changes in the state and returns nothing.

In the following Interfaces needs to be implemented:

## Command

`ICommand` is just a marker interface:

```typescript
export default interface ICommand {}
```
## Command Handler

`ICommandHandler` needs to be implemented in your Use Case *Handler*

```typescript
import type { IAppError } from "../CallbackArg";
import type ICommand from "./Command";

export default interface ICommandHandler {
    handle(command: ICommand): Promise<void|IAppError>;
}
```

## Command Use Case

As explained in [Chapter 3](guide/first-business-module?id=application-layer), we'll define our Use case in the Application Layer:

```typescript
import type { Application } from "hollywood-js";
import type {IAppError} from "hollywood-js/src/Application/Bus/CallbackArg";
import {injectable} from 'inversify';
import CreateCommand from "./command";

export default class CreateCommand implements Application.ICommand {
  constructor(
      public readonly userId: string,
      public readonly username: string,
  ) {}
}


@injectable()
export default class CreateHandler implements Application.ICommandHandler {
    constructor(private readonly repository: SomeRepository) {}

    // This **autowiring** annotation is what maps the Handler with the Command in the Command bus by decoreating the Handler
    @Application.autowiring 
    public async handle(command: CreateCommand): Promise<void | Application.IAppError> {
        // Some logic
        const customer = ...;
        await this.repository.save(customer);
    }
}
```

Once done, register it in the **ModuleContext**

```typescript
import {Framework} from "hollywood-js";
import {InMemoryRepository} from "./read-model/in-memory-repository";
import {SharedModule} from "../../shared/infrastructure/shared-module";
import CreateHandler from "../application/command/create/handler";

const services = (new Map())
        .set("customer.repository", { instance: InMemoryRepository })
;
export const CustomerModule = new Framework.ModuleContext({
  commands: [
    CreateHandler
  ],
  queries: [
      ...
  ],
  services
});
```

It will be then accessible in the kernel

```typescript
const kernel = await KernelFactory();
const logger = kernel.container.get<ILog>("logger");

const uuid = "uuid-fake";
await kernel.app.handle(new CreateCommand(uuid, "Valid-Username"))
```


# Query Bus

## Query

```typescript
import type { Application } from "hollywood-js";

export default class GetCustomerByID implements Application.IQuery {
  constructor(
      public readonly userId: string,
  ) {}
}
```

## Query Handler


```typescript
import type { Application } from "hollywood-js";
import type {IAppError} from "hollywood-js/src/Application/Bus/CallbackArg";
import {injectable} from 'inversify';
import CreateCommand from "./command";

@injectable()
export default class GetCustomerByIDHandler implements Application.IQueryHandler {
    constructor(private readonly repository: InMemoryReadModelRepository) {}

    @Application.autowiring 
    public async handle(query: GetCustomerByID): Promise<Application.IAppResponse | Application.IAppError> {
        const customer = await this.repository.findById(query.userId);

        return {
            data: customer,
            meta: [],
        };
    }
}
```

Once done, register it in the **ModuleContext**

```typescript
import {Framework} from "hollywood-js";
import {InMemoryRepository} from "./read-model/in-memory-repository";
import {SharedModule} from "../../shared/infrastructure/shared-module";
import CreateHandler from "../application/command/create/handler";

const services = (new Map())
        ...
        .set("customer.readMode.repository", { instance: InMemoryReadModelRepository })
;
export const CustomerModule = new Framework.ModuleContext({
  commands: [
      ...
  ],
  queries: [
      GetCustomerByIDHandler
  ],
  services
});
```

It will be then accesible in the kernel

```typescript
const kernel = await KernelFactory();
const logger = kernel.container.get<ILog>("logger");

const uuid = "uuid-fake";
await kernel.app.handle(new CreateCommand(uuid, "Valid-Username"))
```
