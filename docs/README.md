# Hollywood

[![NPM Version](http://img.shields.io/npm/v/hollywood-js.svg?style=flat)](https://www.npmjs.org/package/hollywood-js)
[![NPM Downloads](https://img.shields.io/npm/dm/hollywood-js.svg?style=flat)](https://npmcharts.com/compare/hollywood-js?minimal=true)
[![Build Status](https://github.com/jorge07/hollywood/workflows/CI/badge.svg)](https://github.com/jorge07/hollywood/actions)

Build event-sourced TypeScript backends with clean architecture patterns.

## Where to Start

Choose the path that fits your style:

| Learning Style | Start Here |
|----------------|------------|
| **Step by step** | [Installation](getting-started/installation.md) - Set up and work through each section |
| **Learn by doing** | [Quick Start](getting-started/quick-start.md) - Build as you learn |
| **Reference lookup** | [CQRS](reference/cqrs.md) - Jump to specific topics |

## Quick Install

```bash
npm install hollywood-js reflect-metadata
```

```typescript
import { Framework, Application } from "hollywood-js";

// Handle commands
await kernel.app.handle(new CreateUser(userId, email));

// Ask queries
const user = await kernel.app.ask(new GetUser(userId));
```

## Core Features

- **CQRS Built-in** - Separate read and write paths from day one
- **Event Sourcing** - Full audit trail, time travel debugging
- **Modular Architecture** - Bounded contexts that actually stay bounded
- **TypeScript Native** - Full type safety, no decorators required
- **Production Ready** - Sagas, DLQ, optimistic locking, projection rebuilds

## Documentation Sections

### Getting Started
- [Installation](getting-started/installation.md) - Install and configure
- [Quick Start](getting-started/quick-start.md) - Build your first module

### The Basics
- [Commands](basics/commands.md) - Handle state changes
- [Queries](basics/queries.md) - Read data
- [Events](basics/events.md) - Event-driven communication
- [Dependency Injection](basics/dependency-injection.md) - Wire up services

### Advanced Topics
- [Sagas](advanced/sagas.md) - Long-running workflows
- [Event Versioning](advanced/event-versioning.md) - Schema evolution
- [Dead Letter Queue](advanced/dead-letter-queue.md) - Error handling
- [Projections](advanced/projections.md) - Read models
- [Server Integration](advanced/server-integration.md) - HTTP layer

### Reference
- [CQRS](reference/cqrs.md) - Command and query patterns
- [Event Sourcing](reference/event-sourcing.md) - Event store and aggregates
- [Aggregates](reference/aggregates.md) - Domain modeling
- [Container](reference/container.md) - Dependency injection

## Links

- [Architecture Overview](architecture/overview.md)
- [Features](features.md)
- [GitHub Repository](https://github.com/jorge07/hollywood)
