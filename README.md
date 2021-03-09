# Hollywood

[](https://famfonts.com/wp-content/uploads/hollywood-wide.png)
[![Build Status](https://travis-ci.org/jorge07/hollywood.svg?branch=master)](https://travis-ci.org/jorge07/hollywood) [![Coverage Status](https://coveralls.io/repos/github/jorge07/hollywood/badge.svg?branch=master)](https://coveralls.io/github/jorge07/hollywood?branch=master)

A Typescript port of Broadway https://github.com/broadway/broadway

### Installation

NPM:

`npm install hollywood-js`

Yarn:

`yarn add hollywood-js`


### CQRS Framework with Event Sourcing support.

Features:

- Dependency Injection (Built around Inversify).
  - Module hierarchy DI.
- DDD toolbox
  - Event Driven
    - Support for different event streams
  - In Memory implementations for testing
  - AggregateRoot and EventSourced abstractions
- Event Store
  - Event Store decoupled from storage implementation thanks to DBAL (Database Abstraction Layer)
  - **In Memory** Event Store DBAL implementations for testing
  - Configurable **SnapshotStore** support.
  - In Memory Snapshot DBAL implementation for testing
  - Built in Event Bus 
- Command and Query Bus
  - Command and Query handlers autowiring
  - Middlewares support for Command and Query bus
- Libraries should NOT log, I don't log, I throw Errors.


### Basic Usage

```typescript
import ModuleContext from "./ModuleContext";
import Kernel from "./Kernel";
import {inject} from "inversify";

const parameters = new Map([
  ['hello.style', 'hey']
]);

class Hey {
  constructor(@inject('hello.style') private readonly style: string) {}

  hello(): string {
    return this.style
  }
}

const MainModule = new ModuleContext({
  services: [
    ['hey', {instance: Hey}]
  ]
})

const kernel = new Kernel('dev', true, parameters, MainModule);

kernel.container.get<Hey>('key').hello() // 'key'
```
### Module dependencies

```typescript
import ModuleContext from "./ModuleContext";
import Kernel from "./Kernel";
import {inject} from "inversify";

const parameters = new Map([
  ['hello.style', 'hey']
]);

class Hey {
  constructor(@inject('hello.style') private readonly style: string) {}

  hello(): string {
    return this.style
  }
}

const HeyModule = new ModuleContext({
  services: [
    ['hey', {instance: Hey}]
  ]
})

class Person {
    constructor(@inject('hey') private readonly hey: Hey) {}

    sayHello(): string {
        return this.key.hello()
    }
}

const PersonModule = new ModuleContext({
  services: [
    ['person', {instance: Person}]
  ],
  modules: [HeyModule]
})
const kernel = new Kernel('dev', true, parameters, MainModule);

kernel.container.get<Person>('person').sayHello() // 'key'
```

### Overwrite during testing

```typescript
import ModuleContext from "./ModuleContext";
import Kernel from "./Kernel";
import {inject} from "inversify";

const parameters = new Map([
  ['hello.style', 'hey']
]);


const TestingParameters = new Map([
  ['hello.style', 'HELLOOOOOOO!']
]);

class Hey {
  constructor(@inject('hello.style') private readonly style: string) {}

  hello(): string {
    return this.style
  }
}

const HeyModule = new ModuleContext({
  services: [
    ['hey', {instance: Hey}]
  ]
})

class Person {
    constructor(@inject('hey') private readonly hey: Hey) {}

    sayHello(): string {
        return this.key.hello()
    }
}

const PersonModule = new ModuleContext({
  services: [
    ['person', {instance: Person}]
  ],
  modules: [HeyModule]
})
const kernel = new Kernel('dev', true, parameters, MainModule, TestingParameters);

kernel.container.get<Person>('person').sayHello() // 'HELLOOOOOOO!'
```
