import { DomainEvent } from "../../../src/Domain/Event/DomainEvent";
import { DomainEventStream } from "../../../src/Domain/Event/DomainEventStream";
import { DomainMessage } from "../../../src/Domain/Event/DomainMessage";

class DemoEvent extends DomainEvent {
}

describe("DomainEventStream", () => {
  it("DomainEvent wrap events collection", () => {
    const domainMessage = DomainMessage.create("asdasd", new DemoEvent());
    const stream = new DomainEventStream([domainMessage]);
    expect(stream.events.length).toBe(1);
  });
});
