import type DomainEvent from '../../../src/Domain/Event/DomainEvent';
import DemoEvent from './DemoEvent';

class VersionedEvent implements DomainEvent {
    public readonly version: number = 2;

    constructor(public readonly data: string) {}
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

    it("DomainEvent is a marker interface - events can have any shape", () => {
        const event = new DemoEvent();

        // DomainEvent is an empty marker interface - version is not required
        // Events can define their own properties
        expect(event).toBeDefined();
        expect((event as { version?: number }).version).toBeUndefined();
    });

    it("DomainEvent version can be set in implementations", () => {
        const event = new VersionedEvent("test data");

        expect(event.version).toBe(2);
        expect(event.data).toBe("test data");
    });
});
