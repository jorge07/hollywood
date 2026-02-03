import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import DemoEvent from './DemoEvent';

class Event {
}

describe("DomainMessage", () => {

    it("DomainMessage contain the event type name and payload", () => {
        const event = new DemoEvent();
        const domainMessage = DomainMessage.create("1", 1, event);
        expect(domainMessage.eventType).toBe("DemoEvent");
        expect(domainMessage.uuid).toBe("1");
        expect(domainMessage.occurred).toBeDefined();
    });

    it("DomainMessage contain the event type name and payload of a event that doesn't need to extend DomainEvent", () => {
        const event = new Event();
        const domainMessage = DomainMessage.create("1", 1, event);
        expect(domainMessage.eventType).toBe("Event");
        expect(domainMessage.uuid).toBe("1");
        expect(domainMessage.occurred).toBeDefined();
    });

    it("DomainMessage preserves custom timestamp when provided for replay", () => {
        const event = new DemoEvent();
        const customDate = new Date("2020-01-15T10:30:00.000Z");
        const domainMessage = DomainMessage.create("1", 1, event, [], customDate);
        expect(domainMessage.occurred).toBe(customDate);
        expect(domainMessage.occurred.toISOString()).toBe("2020-01-15T10:30:00.000Z");
    });

    it("DomainMessage uses current time when no timestamp is provided", () => {
        const event = new DemoEvent();
        const before = new Date();
        const domainMessage = DomainMessage.create("1", 1, event);
        const after = new Date();
        expect(domainMessage.occurred.getTime()).toBeGreaterThanOrEqual(before.getTime());
        expect(domainMessage.occurred.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("DomainMessage preserves metadata and custom timestamp together", () => {
        const event = new DemoEvent();
        const customDate = new Date("2019-06-20T14:45:00.000Z");
        const metadata = [{ userId: "user-123" }];
        const domainMessage = DomainMessage.create("1", 1, event, metadata, customDate);
        expect(domainMessage.metadata).toEqual(metadata);
        expect(domainMessage.occurred).toBe(customDate);
    });
});
