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

```typescript
import { Domain } from 'hollywood-js'

export class UserWasCreated extends Domain.DomainEvent {

    constructor(public uuid: string, public email: string){
        super()
    }
}


export class User extends Domain.EventSourced {

    private uuid: string = "";

    private email?: string;

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
}
```

Look at [examples](https://github.com/jorge07/hollywood/tree/master/examples) for a better understanding.
