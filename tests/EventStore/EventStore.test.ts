import { EventBus, EventSubscriber, InMemoryEventStore, EventListener } from "../../src/EventStore";
import { Dog, SayWolf } from "../Domain/AggregateRoot.test";
import DomainEvent from '../../src/Domain/Event/DomainEvent';
import EventStore from '../../src/EventStore/EventStore';

class OnWolfEventSubscriber extends EventSubscriber {
    public wolf: any;

    private onSayWolf(event: SayWolf): void {
        this.wolf = event;
    }
}

class GlobalListener extends EventListener {
    public lastEvent: any;

    on(event: DomainEvent): void {
        this.lastEvent = event;
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
            .addListener(globalListener)
        ;

        pluto.sayWolf();

        store.save(pluto);

        const dog: Dog = await store.load(pluto.getAggregateRootId());
        expect(dog.wolfCount).toBe(1);
        expect(dog.version()).toBe(0);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(globalListener.lastEvent).toBeInstanceOf(SayWolf);
    });

    it("EventStore should throw exception when not aggregate found", async () => {
        const eventBus = new EventBus();
        const store = new EventStore<Dog>(Dog, new InMemoryEventStore(), eventBus);
        const pluto = new Dog();

        const toTest = async () => {
            const x = await store.load(pluto.getAggregateRootId());

            console.log(x);
        };
        expect(toTest()).rejects.toMatchObject(new Error('Not found'));
    });
});
