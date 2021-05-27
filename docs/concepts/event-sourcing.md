# Event Sourcing

Hollywood provides built-in event sourcing capabilities. Those lives in the **EventSourcing** module.

It includes:

- EventSourced entity abstraction
- EventSourcedAggregateRoot entity abstraction
- Event Store
- Snapshot Store 
- Event Bus & Listeners
- *Sometime soon*: Sagas

> Hollywood does not provide any other official Storage than InMemory yet. Exist plans for MongoDB and Postgresql (which I've examples for)

# Drive by example: Modeling Dogs in Up film

<div style="max-width: 968px">
    <img style="float: right;" alt="Dug" src="data:image/jpeg;base64,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" />
    In the <a href="https://en.wikipedia.org/wiki/Up_(2009_film)">Up film from Pixar</a>, the dogs have a mechanism that records and translates to human language.
</div>

Let's draw:

```mermaid
graph TD
    Dog --> |has| VoiceRecorder --> |contains| Translator
    Dog --> say{Say}
    say{Say} --> Wolf
    say{Say} --> Grr
```

In Typescript:

## Events

```typescript
export class SayWolf extends DomainEvent {
    constructor(public readonly dogId: DogId) {
        super();
    }
}

export class SayGrr extends DomainEvent {
    constructor(public readonly dogId: DogId) {
        super();
    }
}
```

## Entities & Aggregates child entities

```typescript
class Translator extends EventSourced {
    public translations: string[] = [];

    public applySayWolf(event: SayWolf) {
        this.translations.push('Hey dude!');
    }
    public applySayGrr(event: SayGrr) {
        this.translations.push('I. Don\'t. Like. That... RUN!');
    }
}

class VoiceRecorder extends EventSourced {
    public recorded: string[] = [];
    private readonly translator: Translator;
    constructor() {
        super();
        this.registerChildren(this.translator = new Translator())
    }

    public applySayWolf(event: SayWolf) {
        this.recorded.push('Wolf');
    }

    public getLastTranslation(): string {
        return this.translator.translations.slice(-1).pop();
    }
}
```

## AggregateRoot

> When an event is *raised* inside an *EventSourced* entity, the entity will look for a method that prefix with *apply* the DomainEvent name on the entity and his different childs.

```typescript
class Dog extends EventSourcedAggregateRoot {
    public wolfCount: number = 0;
    private readonly voiceRecorder: VoiceRecorder;
    constructor(id = '41') {
        super(id);
        this.registerChildren(this.voiceRecorder = new VoiceRecorder())
    }

    public sayWolf(): string {
        super.raise(new SayWolf(this.getAggregateRootId()));

        return this.voiceRecorder.getLastTranslation();
    }

    public sayGrr(): string {
        super.raise(new SayGrr(this.getAggregateRootId()));

        return this.voiceRecorder.getLastTranslation();
    }

    public applySayWolf(event: SayWolf) {
        this.wolfCount++;
    }
    
    public getLastTranslation(): string {
        return this.voiceRecorder.getLastTranslation();
    }
}
```

# Event Store

Hollywood provides an *InMemoryEventStore* but also the necessary Interfaces to create your own Database Abstraction Layer (DBAL).

> You can find an example of a Postgresql EventStoreDBAL and SnapshotStoreDBAL in this [repository](https://github.com/jorge07/billing-api/blob/master/src/Billing/Shared/Infrastructure/EventStore/DBAL.ts)

```typescript
const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), new EventBus());
const Dug = new Dog("1");

console.log(Dug.sayWolf());
// 'Hey dude!'

expect(Dug.version()).toBe(1);

await store.save(Dug);

// Clone Dug
const newDug: Dog = await store.load(Dug.getAggregateRootId()); // The Event Store is able to reconstruct the Aggregate.
expect(newDug.wolfCount).toBe(1);
expect(newDug.version()).toBe(1);
expect(newDug.getLastTranslation()).toBe('Hey dude!');
```

> As mentioned in the [Listeners page](concepts/event-listeners.md), Listeners and Subscribers can be attached to the **EventBus** to execute any action after events are persisted.

# Snapshot Store

In certain Event Sourcing systems, the *Events* volume grow quite fast and in consequence the queries and the time require to reconstruct the Aggregate from the events, can grow exponentially.
There're some mechanisms we can use to mitigate this, such use an Event Store per stream, with the time we may end having the same problem.

The Snapshot Store provides a way to limit the number of events we're going to reconstruct our aggregate from.
It does that defining a **Snapshot Margin** to *take a picture* of the Aggregate after certain amount of versions and each N versions it will overwrite the previous one.

In an Aggregate with 300 events in the event store, the Event Store will need to apply this 300 events to each entity of the aggregate and this is not efficient.
A **Snapshot Margin** of 5 versions will remove at least *295 * N entities* iterations to reconstruct the aggregate.

The Snapshot Store is an optional dependencies of the *Event Store* and the default **Snapshot Margin** is 10.

> Next: [**CQRS**](concepts/cqrs.md)
