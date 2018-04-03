import { EventBus, EventSubscriber, InMemoryEventStore, EventListener } from "../../src/EventStore";
import { Dog, SayWolf } from "../Domain/AggregateRoot.test";
import DomainEvent from '../../src/Domain/Event/DomainEvent';

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
        const store = new InMemoryEventStore(eventBus);
        const pluto = new Dog(Math.random().toString());

        eventBus
            .attach(SayWolf, onWolfEventSubscriber)
            .addListener(globalListener)
        ;


        pluto.sayWolf();

        store.append(
            pluto.getAggregateRootId(),
            pluto.getUncommitedEvents(),
        );

        const events = await store.load(pluto.getAggregateRootId());
        const fromHistory = (new Dog(pluto.getAggregateRootId())).fromHistory(events);

        expect(fromHistory.wolfCount).toBe(1);
        expect(fromHistory.playhead).toBe(0);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf);
        expect(globalListener.lastEvent).toBeInstanceOf(SayWolf);

    });
});
