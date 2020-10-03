# Hollywood

[](https://famfonts.com/wp-content/uploads/hollywood-wide.png)
[![Build Status](https://travis-ci.org/jorge07/hollywood.svg?branch=master)](https://travis-ci.org/jorge07/hollywood) [![Coverage Status](https://coveralls.io/repos/github/jorge07/hollywood/badge.svg?branch=master)](https://coveralls.io/github/jorge07/hollywood?branch=master)

A Typescript port of Broadway https://github.com/broadway/broadway

### Installation

NPM:

`npm install hollywood-js`

Yarn:

`yarn add hollywood-js`

### Usage

See it in action here: https://github.com/jorge07/billing-api

```typescript
import "reflect-metadata";
import { PARAMETERS_ALIAS, SERVICES_ALIAS } from 'hollywood-js/src/Framework/Container/Bridge/Alias';
import { Framework } from "hollywood-js";
import { EventListener } from "hollywood-js/src/EventStore";
import { Domain } from 'hollywood-js';
import { ICommand } from "hollywood-js/src/Application";
import type EventStore from 'hollywood-js/src/EventStore/EventStore';
import { autowiring } from 'hollywood-js/src/Application';
import { injectable, inject } from 'inversify';

// Domain definition

export class UserWasCreated extends Domain.DomainEvent {
    constructor(public uuid: string, public email: string){
        super()
    }
}

export default class User extends Domain.EventSourcedAggregateRoot {
    private uuid: string = "";
    private email: string = "";

    public static create(uuid: string, email: string): User {
        const instance = new User(uuid);

        instance.raise(new UserWasCreated(uuid, email));

        return instance;
    }

    public getAggregateRootId(): string {
        return this.uuid;
    }

    protected applyUserWasCreated(event: UserWasCreated): void {
        this.uuid = event.uuid;
        this.email = event.email;
    }

    get mail(): string {
        return this.email;
    }
}

// Application layer

@injectable()
export default class CreateUserHandler {

    constructor(
        @inject("user.eventStore") private readonly eventStore: EventStore<User>
    ) {}

    @autowiring
    async handle(command: CreateUser): Promise<void> {
        const user = User.create(command.uuid, command.email);

        await this.eventStore.save(user);
    }
}

export default class CreateUser implements ICommand {
    constructor(
        public readonly uuid: string,
        public readonly email: string,
    ) {}
}


class EchoListener extends EventListener {
    public on(message: DomainMessage): void | Promise<void> {
        console.log(`The following event with id ${message.uuid} was Stored in Memory`, message.event); // Confirm that event was received
    }
}

// Define parameters and services

const parameters = new Map([
    [PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN, "40"] // You can overwrite default parameters
]);

const services = new Map([
    [SERVICES_ALIAS.COMMAND_HANDLERS, {
        collection: [
            CreateUserHandler
        ]
    }],
    ["user.eventStore", {
        eventStore: User
    }],
    ["generic.subscriber", {
        instance: EchoListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true
    }],
]);


(async () => {
    // Boot application
    const kernel = await Framework.Kernel.create("dev", true, services, parameters);
    // Create a user
    await kernel.handle(new CreateUser("1", "demo@example.org"));
    // Load from InMemoryStore
    // And recreate User from events
    const recreatedUser = await kernel.container.get<EventStore<User>>("user.eventStore").load("1"); 
    // Display the created user
    console.log(recreatedUser); 
    // Confirm overwrite default parameters (snapshotMargin 10 -> 40)
    console.log(
        kernel.container.get("user.eventStore") 
    );
})()
```

Look at [examples](https://github.com/jorge07/hollywood/tree/master/examples) for a better understanding.

#### Testing

This library allows you to define test services and parameters that overwrites the main ones and only gets loaded on test environment.
An example of how to use this can e something like this:

```typescript
import { Framework } from "hollywood-js";
import { parameters } from "../config/parameters";
import { testParameters } from "../config/testParameters";
import { services } from "../config/services";
import { testServices } from "../config/testServices";

export default async function KernelFactory(debug: boolean): Promise<Framework.Kernel> {
    return await Framework.Kernel.create(
        process.env.NODE_ENV,
        debug,
        services,
        parameters,
        testServices,
        testParameters,
    );
}
```