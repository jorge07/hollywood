import { DomainEvent, DomainEventStream, DomainMessage } from "../../../src/Domain";

class DemoEvent extends DomainEvent {
}

describe("DomainEventStream", () => {
  it("DomainEvent wrap events collection", () => {
    const domainMessage = DomainMessage.create("asdasd", new DemoEvent());
    const stream = new DomainEventStream([domainMessage]);
    expect(stream.events.length).toBe(1);
  });
});
