# Features

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
