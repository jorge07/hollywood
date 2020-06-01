import DomainMessage from "../../../src/Domain/Event/DomainMessage";
import DemoEvent from './DemoEvent';

class Event { }

describe("DomainMessage", () => {

  it("DomainMessage contain the event type name and payload", () => {
      const event = new DemoEvent();
      const domainMessage = DomainMessage.create("1", 1, event);
      expect(domainMessage.eventType).toBe("DemoEvent");
      expect(domainMessage.uuid).toBe("1");
      expect(domainMessage.ocurredOn).toBeDefined();
  });

  it("DomainMessage contain the event type name and payload of a event that doesn't need to extend DomainEvent", () => {
      const event = new Event();
      const domainMessage = DomainMessage.create("1", 1, event);
      expect(domainMessage.eventType).toBe("Event");
      expect(domainMessage.uuid).toBe("1");
      expect(domainMessage.ocurredOn).toBeDefined();
  });
});
