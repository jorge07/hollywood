import { DomainEvent, DomainMessage, DomainEventStream } from "../../src/Domain";
import { EventBus, EventListener, EventStore, EventSubscriber, InMemoryEventStore, IEventStoreDBAL, AggregateRootNotFoundException } from "../../src/EventStore";
import { Dog, SayWolf, SayGrr } from '../Domain/AggregateRoot.test';

class OnWolfEventSubscriber extends EventSubscriber {
    public wolf: any;
    public grr: any;

    private onSayWolf(event: SayWolf): void {
        this.wolf = event;
    }

    private onSayGrr(event: SayWolf): void {
        this.grr = event;
    }
}

class GlobalListener extends EventListener {
    public lastEvent: any;
    public events: DomainMessage[] = [];

    public on(event: DomainMessage): void {
        this.lastEvent = event.event;
        this.events.push(event);
    }
}

export default class InMemoryErrorEventStore implements IEventStoreDBAL {
    private readonly events: any[] = [];

    public async load(aggregateId: string, from: number = 0): Promise<DomainEventStream> {
        throw new Error('Fail Read');
    }

    public async loadFromTo(aggregateId: string, from: number = 0): Promise<DomainEventStream> {
        throw new Error('Fail Read');
    }

    public async append(aggregateId: string, stream: DomainEventStream): Promise<void> {
        throw new Error('Fail Write');
    }
}


describe("EventStore", () => {
    it("EventStore should store, publish and retrieve events", async () => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber();
        const globalListener = new GlobalListener();
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog("31");

        eventBus
            .attach(SayWolf, onWolfEventSubscriber)
            .attach(SayGrr, onWolfEventSubscriber)
            .addListener(globalListener)
        ;

        pluto.sayWolf();
        pluto.sayGrr();

        expect(pluto.version()).toBe(1);

        store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(dog.wolfCount).toBe(1);
        expect(dog.version()).toBe(1);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(onWolfEventSubscriber.grr).toBeInstanceOf(SayGrr);
        expect(globalListener.lastEvent).toBeInstanceOf(SayGrr);
    });

    it("EventStore be able to replay events", async () => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber();
        const globalListener = new GlobalListener();
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog("31");

        eventBus
            .attach(SayWolf, onWolfEventSubscriber)
            .attach(SayGrr, onWolfEventSubscriber)
            .addListener(globalListener)
        ;

        pluto.sayWolf();
        pluto.sayGrr();

        expect(pluto.version()).toBe(1);

        store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(dog.wolfCount).toBe(1);
        expect(dog.version()).toBe(1);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(onWolfEventSubscriber.grr).toBeInstanceOf(SayGrr);
        expect(globalListener.lastEvent).toBeInstanceOf(SayGrr);

        expect(globalListener.events.length).toBe(2);

        await store.replayFrom(pluto.getAggregateRootId(), 0);

        expect(globalListener.events.length).toBe(4);

    });

    it("EventStore should throw exception when not aggregate found", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog("31");

        const toTest = async () => {
            return await store.load(pluto.getAggregateRootId());
        };

        expect(toTest()).rejects.toMatchObject(new Error("Not found"));
    });

    it("EventStore should collect exceptions", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryErrorEventStore(), eventBus);
        const pluto = new Dog("31");

        pluto.sayGrr();

        await expect(store.save(pluto)).rejects.toMatchObject(new Error("Fail Write"));

        await expect(store.load(pluto.getAggregateRootId())).rejects.toMatchObject(new Error("Fail Read"));
    });
});
