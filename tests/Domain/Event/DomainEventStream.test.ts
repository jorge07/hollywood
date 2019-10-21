import { DomainEvent, DomainEventStream, DomainMessage } from "../../../src/Domain";
import DemoEvent from './DemoEvent';

describe("DomainEventStream", () => {
  it("DomainEvent wrap events collection", () => {
    const domainMessage = DomainMessage.create("asdasd", 0, new DemoEvent());
    const stream = new DomainEventStream([domainMessage]);
    expect(stream.events.length).toBe(1);
  });
});
