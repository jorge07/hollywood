import { DomainEvent } from "../../../src/Domain";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";

class DemoEvent extends DomainEvent {

}

describe("DomainMessage", () => {

  it("DomainMessage contain the event type name and payload", () => {
      const event = new DemoEvent();
      const domainMessage = DomainMessage.create("1", event);
      expect(domainMessage.eventType).toBe("DemoEvent");
  });
});
