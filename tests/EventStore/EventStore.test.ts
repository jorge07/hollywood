import { DomainEvent, DomainMessage } from "../../src/Domain";
import { EventBus, EventListener, EventStore, EventSubscriber, InMemoryEventStore } from "../../src/EventStore";
import { Dog, SayWolf, SayGrr } from '../Domain/AggregateRoot.test';

class OnWolfEventSubscriber extends EventSubscriber {
    public wolf: any;
    public grr: any;

    constructor() {
        super();
    }

    private onSayWolf(event: SayWolf): void {
        this.wolf = event;
    }

    private onSayGrr(event: SayWolf): void {
        this.grr = event;
    }
}

class GlobalListener extends EventListener {
    public lastEvent: any;

    public on(event: DomainMessage): void {
        this.lastEvent = event.event;
    }
}

describe("EventStore", () => {
    it("EventStore should store, publish and retrieve events", async () => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber();
        const globalListener = new GlobalListener();
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog();

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

    it("EventStore should throw exception when not aggregate found", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog();

        const toTest = async () => {
            const x = await store.load(pluto.getAggregateRootId());

            console.log(x);
        };
        expect(toTest()).rejects.toMatchObject(new Error("Not found"));
    });
});
