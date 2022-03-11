# Hollywood

[](https://famfonts.com/wp-content/uploads/hollywood-wide.png)
[![Build Status](https://travis-ci.org/jorge07/hollywood.svg?branch=master)](https://travis-ci.org/jorge07/hollywood) [![Coverage Status](https://coveralls.io/repos/github/jorge07/hollywood/badge.svg?branch=master)](https://coveralls.io/github/jorge07/hollywood?branch=master)
[![NPM Version](http://img.shields.io/npm/v/hollywood-js.svg?style=flat)](https://www.npmjs.org/package/hollywood-js)
[![NPM Downloads](https://img.shields.io/npm/dm/hollywood-js.svg?style=flat)](https://npmcharts.com/compare/hollywood-js?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=hollywood-js)](https://packagephobia.now.sh/result?p=hollywood-js)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

Hollywood-js is a Framework for building very modular and high scalable server side applications following CQRS (Command Query Responsibility Segregation) and enforcing IoC.

It provides a Bounded Context oriented architecture, enforcing isolation and event driven communication between them.
Hollywood-js it's strongly CQRS structured, allowing you to define or not a DDD / Clean Architecture project.

Includes advanced Event Sourcing capabilities like Event Store abstractions, Event Store Snapshots, Projections and Event Bus (Listeners and Subscribers).

## Documentation 

Documentation about Hollywood, DDD and EventSourcing available [here] (https://jorge07.github.io/hollywood/) 
> Documentation still a wip

## Installation

NPM:

`npm install hollywood-js`

Yarn:

`yarn add hollywood-js`


### CQRS Framework with Event Sourcing support.

Features:

- Dependency Injection (Built around Inversify).
  - Module hierarchy for Bounded Context isolation.
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
  - **Middlewares support** for Command and Query bus
- Libraries should NOT log, I don't log, I throw Errors.
- Not a server framework but tested with express and fastify (this last one the one I recommend, see /examples).


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


