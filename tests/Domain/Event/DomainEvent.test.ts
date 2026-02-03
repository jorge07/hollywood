import DemoEvent from './DemoEvent';
import type DomainEvent from '../../../src/Domain/Event/DomainEvent';

describe("DomainEvent", () => {

    it("DomainEvent implementations should use constructor.name for event type identification", () => {
        const event = new DemoEvent();

        // Event type is determined by constructor.name, not a method
        // This is how DomainMessage.extractEventType works
        expect(event.constructor.name).toBe('DemoEvent');
    });

    it("DomainEvent implementations satisfy the marker interface", () => {
        const event: DomainEvent = new DemoEvent();

        // The event should be assignable to DomainEvent type
        expect(event).toBeDefined();
    });
});
