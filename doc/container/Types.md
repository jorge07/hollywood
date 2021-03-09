# Container Service Types

Hollywood uses Inversify for DI. This allows flexibility and extensibility. 
We provide several abstractions to simplify the service definitions:

- AsyncType: Allows asynchronous initialization of a service.
- CollectionType: Collection of services under the same name.
- CustomType: Allows any function.
- EventStoreType: Special service that allows you to define an `EventStore` service for you `AggregateRoot`
- ListenerType: Allows you to listen for one or more events send into a defined EventBus.
- StandardType: Any instance class that's not too complex.

Hollywood predefined services:

- "hollywood.application.command.handlers": Will be used internally to register your handlers
- "hollywood.application.query.handlers": Will be used internally to register your handlers
- "hollywood.application.command.middleware": Will be used internally to register your middlewares
- "hollywood.application.query.middleware": Will be used internally to register your middlewares
- "hollywood.infrastructure.eventBus.default": Predefined default event bus
- "hollywood.infrastructure.eventStore.dbal.default": Will be used internally to register the default event store DBAL
- "hollywood.infrastructure.eventStore.snapshot.default": Will be used internally to register the default snapshot service
- "hollywood.infrastructure.eventStore.snapshot.dbal.default": :Will be used internally to register the default snapshot DBAL

