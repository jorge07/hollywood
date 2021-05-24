# Container Service Types

Hollywood uses Inversify for DI. This allows flexibility and extensibility. 
We provide several abstractions to simplify the service definitions:

# AsyncType

Allows asynchronous initialization of a service.

```typescript
async function ReadModelConnectionFactory() {
    const connection = new PostgresClient(Object.assign({}, parameters.get("orm.readModel")));
    try {
        await connection.connect();
    } catch (err) {
        throw new Error(`PG connection to read model error: ${err.message}`);
    }

    return { connected: true };
}

const services = new Map<string, IService>([
    ["test.async", {
        async: ReadModelConnectionFactory
    }]
]);
const mainModule = new ModuleContext({ services });
```

# CollectionType

Collection of services under the same name.

```typescript
const services = new Map<string, IService>([
    ['cart.strategies.enabled', {
        collection: [
            Coupon,
            B2B,
            Buy2Pay1,
        ]
    }]
]);
const mainModule = new ModuleContext({ services });
```  

# CustomType

Allows any function.

```typescript
const services = new Map<string, IService>([
    ['custom.factory', {
        custom: () => {
            return customFactoryMethod(config.get('custom.config'))
        }
    }]
]);
const mainModule = new ModuleContext({ services });
```

# EventStoreType

Special service that allows you to define an `EventStore` service for you `AggregateRoot`

```typescript
const services = new Map([
    ["user.eventStore", {
        eventStore: User
    }]
]);

const module = new ModuleContext({ services });

```

# ListenerType

Allows you to listen for one or more events send into a defined EventBus.

```typescript
const services = new Map([
    ["user.eventStore", {
        eventStore: User
    }],
    ["generic.subscriber", {
        instance: EchoListener,
        bus: SERVICES_ALIAS.DEFAULT_EVENT_BUS,
        listener: true
    }],
]);

const module = new ModuleContext({services, commands: [CreateUserHandler]});
```

# StandardType

Any instance class that's not too complex.

```typescript
const services = new Map<string, IService>([
    ['shared.infrastructure.logger', {
        instance: Logger
    }]
]);
const mainModule = new ModuleContext({ services });
```

# Hollywood predefined services:

- "hollywood.application.command.handlers": Will be used internally to register your handlers
- "hollywood.application.query.handlers": Will be used internally to register your handlers
- "hollywood.application.command.middleware": Will be used internally to register your middlewares
- "hollywood.application.query.middleware": Will be used internally to register your middlewares
- "hollywood.infrastructure.eventBus.default": Predefined default event bus
- "hollywood.infrastructure.eventStore.dbal.default": Will be used internally to register the default event store DBAL
- "hollywood.infrastructure.eventStore.snapshot.default": Will be used internally to register the default snapshot service
- "hollywood.infrastructure.eventStore.snapshot.dbal.default": :Will be used internally to register the default snapshot DBAL
