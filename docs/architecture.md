<style>
.cluster rect {
    fill: #fff !important;
    stroke: #000 !important;
}
</style>
# Hollywood Architecture

Here an attempt to explain with graphs the Hollywood-js Components dependencies, boot and instantiation process.

# Components

## Application


```mermaid
graph LR
    subgraph Application
    
        App --> |has| CommandBus
        App --> |has| QueryBus

        MessageBus --> |Contains 1:N| Middlewares

        CommandBus --> |extends| MessageBus
        QueryBus --> |extends| MessageBus
        
        QueryBus --> QueryHandlerResolver
        CommandBus --> CommandHandlerResolver
        
        CommandHandlerResolver --> |Map| Command --> |With| CommandHandler
        QueryHandlerResolver --> |Map| Query --> |With| QueryHandler
        
        QueryBus --> |Returns| QueryBusResponse --> QBResponse[IAppResponse/ IAppError]
        CommandBus --> |Returns| CBResponse[Void/IAppError]
    end
```

## Domain

```mermaid
graph TD

    subgraph dom[Domain]
        DomainEvent
        DomainMessage -->|Envelops| DomainEvent
        DomainEventStream --> |Contains 0:N| DomainMessage
    
        AggregateRoot
        ValueObjects
        Entity
        
        Entity -.-> |Contains 0:N| Entity
        Entity -.-> |Contains 0:N| ValueObjects
        ValueObjects -.-> |Contains 0:N| ValueObjects

        Aggregates --> |Contains 1:N| Entity
        AggregateRoot --> |Unique Entrypoint For| Aggregates
        AggregateRoot --> |Is| Entity
        AggregateRoot --> |Raise 0:N| DomainEvent
    
    
        Entity --> |Can be| EventSourced
        EventSourced --> |Contructed from N| DomainEventStream
        AggregateRoot --> |Can be| EventSourcedAggregateRoot --> |Output| DomainEventStream
        AggregateRoot -.-> |Persisted by| Repository
    end
    Repository -.-> |Uses| ES[(Event Store)]
    subgraph EventSourcing

        ES
    end
```

## EventSourcing

```mermaid
graph LR
    subgraph EventSourcing

        ES[(EventStore)] --> |Store / Retrieve| EventSourcedAggregateRoot
        ES --> |Require| esdbal[(EventStore DBAL)]
        ES -.-> |May Require| SnapshotStore
        SnapshotStore[(Snapshot Store)] --> |Uses| sedbal[(SnapshotStore DBAL)]
        ES --> |Throws| AggregateRootNotFoundException>AggregateRootNotFoundException]
        ES --> publish{publish DomainMessage} --> |Into| EventBus[EventBus] 
        publish(publish DomainMessage) --> DomainMessage 
        EventBus --> broadcast>Broadcast DomainMessage]
        broadcast --> EventListeners
        broadcast --> EventSubscribers
    end
```

## Framework


```mermaid
graph LR

    subgraph Application
    
        App
        CommandHandler
        QueryHandler
    end
    subgraph Framework
        Kernel
        ParametersList --> Parameters
        ServicesList --> Services
        Contaner
        Module
        
        Module --> |Defines| ServicesList
        Module -.-> |Define N| CommandHandler
        Module -.-> |Define N| QueryHandler
        Module --> |Define N| Middlewares
        Module -.-> |Define N dependencies| Modules
        
        Kernel --> |From| ParametersList --> |And| Module
        Kernel --> |Mounts| HollywoodModule
        Kernel --> |Builds| Container
        Kernel --> |Builds| App
    end
```

## All together


```mermaid
graph LR
    subgraph dom[Domain]
        DomainEvent
        DomainMessage -->|Envelops| DomainEvent
        DomainEventStream --> |Contains 0:N| DomainMessage
    
        AggregateRoot
        ValueObjects
        Entity
        
        Entity -.-> |Contains 0:N| Entity
        Entity -.-> |Contains 0:N| ValueObjects
        ValueObjects -.-> |Contains 0:N| ValueObjects

        Aggregates --> |Contains 1:N| Entity
        AggregateRoot --> |Unique Entrypoint For| Aggregates
        AggregateRoot --> |Is| Entity
        AggregateRoot --> |Raise 0:N| DomainEvent
    
    
        Entity --> |Can be| EventSourced
        EventSourced --> |Contructed from N| DomainEventStream
        AggregateRoot --> |Can be| EventSourcedAggregateRoot --> |Output| DomainEventStream
        Repository
    end
    
    Repository --> |Uses| ES
    subgraph EventSourcing

        ES[(EventStore)] --> |Store / Retrieve| EventSourcedAggregateRoot
        ES --> |Require| esdbal[(EventStore DBAL)]
        ES -.-> |May Require| SnapshotStore
        SnapshotStore[(Snapshot Store)] --> |Uses| sedbal[(SnapshotStore DBAL)]
        ES --> |Throws| AggregateRootNotFoundException>AggregateRootNotFoundException]
        ES --> publish{publish DomainMessage} --> |Into| EventBus[EventBus] 
        publish(publish DomainMessage) --> DomainMessage 
        EventBus --> broadcast>Broadcast DomainMessage]
        broadcast --> EventListeners
        broadcast --> EventSubscribers
    end
    
    subgraph Application
    
        App --> |has| CommandBus
        App --> |has| QueryBus

        MessageBus --> |Contains 1:N| Middlewares

        CommandBus --> |extends| MessageBus
        QueryBus --> |extends| MessageBus
        
        QueryHandlerResolver --> QueryBus
        CommandHandlerResolver --> CommandBus
        
        CommandHandlerResolver --> |Map| Command --> |With| CommandHandler
        QueryHandlerResolver --> |Map| Query --> |With| QueryHandler
        
        QueryBus --> |Returns| QueryBusResponse --> QBResponse[IAppResponse/ IAppError]
        CommandBus --> |Returns| CBResponse[Void/IAppError]
    end
    subgraph Framework
        Kernel
        ParametersList --> Parameters
        ServicesList --> Services
        Contaner
        Module
        
        Module --> |Defines| ServicesList
        Module -.-> |Define N| CommandHandler
        Module -.-> |Define N| QueryHandler
        Module --> |Define N| Middlewares
        Module -.-> |Define N dependencies| Modules
        
        Kernel --> |From| ParametersList --> |And| Module
        Kernel --> |Mounts| HollywoodModule
        Kernel --> |Builds| Container
        Kernel --> |Builds| App
    end
```

## Instantiation process 

```mermaid
graph TD
    testConf[TestConfig]
    conf[Config]
    c[Container]
    s[Services]
    mc[ModuleContext]
    mm[MainModuleContext]
    h[HollywoodModule]
    k[Kernel]
    kf[Kernel.createFromModuleContext]
    
    mc --> |define.services| s
    s -.-> |may.depend.on| s
    s -.-> |may.depend.on| conf
    mc -.-> |define.dependencies| mc

    mm -.-> |consume.dependencies| mc

    kf --> with(with)
    with --> conf
    with --> mm
    with --> testConf
    kf --> testSuite(Overwrites config on test suite)
    kf --> |builds| c
    c --> |registers| conf --> afterRegisterConf(Then) --> |loads.hollywood.internal.components| h
    h --> |then.recursive.async.container.module.creation| asyncContainerModule
    asyncContainerModule --> reveivesModule(ReceiveMainModule) --> |Calls module.load recursively| mm
    reveivesModule --> |bind.services.to| ContainerTypes
    ContainerTypes --> onCompleted(On Completed) --> |bind| Listeners(Listeners to EventBus)
    Listeners --> |OnContainerCreated| k
    
    k --> rec{Receive} --> env
    rec --> container
    k --> |Calls| AppBuilder
    AppBuilder --> ext(Extract From Container) 
    ext --> Commands
    ext --> Queries
    ext --> Middlewares
    Commands --> ThenBind(Bind Command and Query Buses)
    Queries --> ThenBind(Bind Command and Query Buses)
    Middlewares --> ThenBind(Bind Command and Query Buses)
    ThenBind --> |on| App --> |Exposes| ask(QueryBus)
    App --> |Exposes| handle(CommandBus)
    k --> kp(public API)
    kp --> c
    kp --> App
    kp --> env
    
```
