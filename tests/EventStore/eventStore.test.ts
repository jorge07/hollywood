import { Dog } from '../Domain/AggregateRoot.test';
import {InMemoryEventStore} from "../../src/EventStore";

describe('EventStore', () => {
    it('EvnetStore should store and retrieve events', () => {
        const store = new InMemoryEventStore();
        const pluto = new Dog(Math.random().toString());

        pluto.sayWolf();

        store.append(
            pluto.getAggregateRootId(), 
            pluto.getUncommitedEvents()
        );

        const events = store.load(pluto.getAggregateRootId());
        const fromHistory = (new Dog(pluto.getAggregateRootId())).fromHistory(events);

        expect(fromHistory.wolfCount).toBe(1);
        expect(fromHistory.playhead()).toBe(0)
    })
});
