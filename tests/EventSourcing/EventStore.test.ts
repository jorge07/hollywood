import "reflect-metadata";

import {Dog, SayWolf, SayGrr} from '../Domain/AggregateRoot.test';
import EventSubscriber from "../../src/EventSourcing/EventBus/EventSubscriber";
import EventListener from "../../src/EventSourcing/EventBus/EventListener";
import DomainMessage from "../../src/Domain/Event/DomainMessage";
import IEventStoreDBAL from "../../src/EventSourcing/IEventStoreDBAL";
import DomainEventStream from "../../src/Domain/Event/DomainEventStream";
import EventBus from "../../src/EventSourcing/EventBus/EventBus";
import EventStore from "../../src/EventSourcing/EventStore";
import InMemoryEventStore from "../../src/EventSourcing/InMemoryEventStore";

class OnWolfEventSubscriber extends EventSubscriber {
    public wolf: any;
    public grr: any;

    protected onSayWolf(event: SayWolf): void {
        this.wolf = event;
    }

    protected onSayGrr(event: SayWolf): void {
        this.grr = event;
    }
}

// tslint:disable-next-line:max-classes-per-file
class GlobalListener extends EventListener {
    public lastEvent: any;
    public events: DomainMessage[] = [];

    constructor(
        private readonly doAsync: boolean = false
    ) {
        super();
    }

    public on(event: DomainMessage): Promise<any> | any {
        if (!this.doAsync) {
            this.lastEvent = event.event;
            this.events.push(event);
            return;
        }

        setTimeout(() => {
            this.lastEvent = event.event;
            this.events.push(event);
        }, 100);
    }
}

// tslint:disable-next-line:max-classes-per-file
export default class InMemoryErrorEventStore implements IEventStoreDBAL {

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
    it("EventSourcing should store, publish and retrieve events", async () => {
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

        await store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(dog.wolfCount).toBe(1);
        expect(dog.version()).toBe(1);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(onWolfEventSubscriber.grr).toBeInstanceOf(SayGrr);
        expect(globalListener.lastEvent).toBeInstanceOf(SayGrr);
    });

    it("AsyncType Event Listeners should not stop the execution but get executed", async (done) => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber();
        const globalListener = new GlobalListener(true);
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

        await store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(dog.wolfCount).toBe(1);
        expect(dog.version()).toBe(1);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(onWolfEventSubscriber.grr).toBeInstanceOf(SayGrr);
        expect(globalListener.lastEvent).toBe(undefined);
        expect(globalListener.events.length).toBe(0);
        setTimeout(() => {
            expect(globalListener.lastEvent).toBeInstanceOf(SayGrr);
            expect(globalListener.events.length).toBe(2);
            done()
        }, 150);
    });

    it("EventSourcing be able to replay events", async () => {
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

        await store.save(pluto);

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

    it("EventSourcing should throw exception when not aggregate was found", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog("31");

        const toTest = async () => {
            return await store.load(pluto.getAggregateRootId());
        };

        expect(toTest()).rejects.toMatchObject(new Error("Not found"));
    });

    it("EventSourcing should collect exceptions", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryErrorEventStore(), eventBus);
        const pluto = new Dog("31");

        pluto.sayGrr();

        await expect(store.save(pluto)).rejects.toMatchObject(new Error("Fail Write"));

        await expect(store.load(pluto.getAggregateRootId())).rejects.toMatchObject(new Error("Fail Read"));
    });
});
