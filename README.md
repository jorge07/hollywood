# Hollywood

[![CI](https://github.com/jorge07/hollywood/actions/workflows/tests.yml/badge.svg)](https://github.com/jorge07/hollywood/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/jorge07/hollywood/badge.svg?branch=master)](https://coveralls.io/github/jorge07/hollywood?branch=master)
[![NPM Version](https://img.shields.io/npm/v/hollywood-js.svg)](https://www.npmjs.org/package/hollywood-js)
[![NPM Downloads](https://img.shields.io/npm/dm/hollywood-js.svg)](https://npmcharts.com/compare/hollywood-js?minimal=true)
[![Install Size](https://packagephobia.now.sh/badge?p=hollywood-js)](https://packagephobia.now.sh/result?p=hollywood-js)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

A TypeScript framework for building modular, scalable server applications using **CQRS**, **Event Sourcing**, and **Domain-Driven Design**.

## Features

| Category | Capabilities |
|----------|-------------|
| **CQRS** | Command/Query buses with middleware support, automatic handler autowiring |
| **Event Sourcing** | Event Store with snapshots, projections, and event bus (listeners & subscribers) |
| **DDD Toolbox** | AggregateRoot abstractions, Bounded Context isolation, event-driven architecture |
| **Dependency Injection** | Built on Inversify with hierarchical module system |
| **Testing** | In-memory implementations for Event Store, Snapshots, and all DBALs |

## Installation

```bash
npm install hollywood-js
```

## Quick Start

### Basic Dependency Injection

```typescript
import { ModuleContext, Kernel } from "hollywood-js";
import { inject } from "inversify";

class GreetingService {
  constructor(@inject('greeting.style') private readonly style: string) {}

  greet(): string {
    return this.style;
  }
}

const AppModule = new ModuleContext({
  services: [
    ['greetingService', { instance: GreetingService }]
  ]
});

const parameters = new Map([
  ['greeting.style', 'Hello, World!']
]);

const kernel = new Kernel('dev', true, parameters, AppModule);
kernel.container.get<GreetingService>('greetingService').greet(); // 'Hello, World!'
```

### Module Composition

```typescript
import { ModuleContext, Kernel } from "hollywood-js";
import { inject } from "inversify";

// Shared module
class Logger {
  log(msg: string): void {
    console.log(`[LOG] ${msg}`);
  }
}

const LoggerModule = new ModuleContext({
  services: [
    ['logger', { instance: Logger }]
  ]
});

// Feature module with dependency
class UserService {
  constructor(@inject('logger') private readonly logger: Logger) {}

  createUser(name: string): void {
    this.logger.log(`Creating user: ${name}`);
  }
}

const UserModule = new ModuleContext({
  services: [
    ['userService', { instance: UserService }]
  ],
  modules: [LoggerModule] // Import dependencies
});

const kernel = new Kernel('dev', true, new Map(), UserModule);
kernel.container.get<UserService>('userService').createUser('Alice');
```

## Documentation

Full documentation on Hollywood, DDD patterns, and Event Sourcing is available at **[jorge07.github.io/hollywood](https://jorge07.github.io/hollywood/)**.

## Philosophy

- **Bounded Context isolation** — Modules enforce clear boundaries between domains
- **Event-driven communication** — Loose coupling through events, not direct calls
- **Storage agnostic** — DBAL abstractions let you swap implementations freely
- **No logging, only errors** — Libraries shouldn't log; they should throw meaningful errors
- **Framework agnostic** — Works with Express, Fastify, or any Node.js server (see `/examples`)

## License

MIT
