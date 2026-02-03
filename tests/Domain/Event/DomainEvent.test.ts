import DomainEvent from '../../../src/Domain/Event/DomainEvent';
import DemoEvent from './DemoEvent';
import type DomainEvent from '../../../src/Domain/Event/DomainEvent';

class VersionedEvent extends DomainEvent {
    public readonly version: number = 2;

    constructor(public readonly data: string) {
        super();
    }
}

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

    it("DomainEvent should have a default version of 1", () => {
        const event = new DemoEvent();

        expect(event.version).toBe(1);
    });

    it("DomainEvent version can be overridden in subclasses", () => {
        const event = new VersionedEvent("test data");

        expect(event.version).toBe(2);
        expect(event.data).toBe("test data");
    });
});
