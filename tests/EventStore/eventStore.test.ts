import {Dog, SayWolf} from '../Domain/AggregateRoot.test';
import {InMemoryEventStore} from "../../src/EventStore";
import {EventBus} from "../../src/EventStore/EventBus/EventBus";
import {EventSubscriber} from "../../src/EventStore/EventBus/EventSubscriber";

class OnWolfEventSubscriber extends EventSubscriber {
    wolf: any;

    private onSayWolf(event: SayWolf): void {
        this.wolf = event
    }
}

describe('EventStore', () => {
    it('EventStore should store, publish and retrieve events', () => {
        const onWolfEventSubscriber = new OnWolfEventSubscriber;

        const eventBus = new EventBus();
        eventBus.attach(SayWolf, onWolfEventSubscriber);

        const store = new InMemoryEventStore(eventBus);
        const pluto = new Dog(Math.random().toString());

        pluto.sayWolf();

        store.append(
            pluto.getAggregateRootId(), 
            pluto.getUncommitedEvents()
        );

        const events = store.load(pluto.getAggregateRootId());
        const fromHistory = (new Dog(pluto.getAggregateRootId())).fromHistory(events);

        expect(fromHistory.wolfCount).toBe(1);
        expect(fromHistory.playhead()).toBe(0);

        expect(onWolfEventSubscriber.wolf).toBeInstanceOf(SayWolf)
    })
});
