import { DomainEventStream, DomainMessage } from "../../../src/Domain";
import DemoEvent from './DemoEvent';

describe("DomainEventStream", () => {
  it("DomainEvent wrap events collection", () => {
    const domainMessage = DomainMessage.create("asdasd", 0, new DemoEvent());
    const stream = new DomainEventStream([domainMessage], "test");
    expect(stream.name).toBe("test");
    expect(stream.events.length).toBe(1);
    expect(stream.isEmpty()).toBe(false);
  });
  
  it("DomainEvent wrap empty events collection", () => {
    const stream = new DomainEventStream();
    expect(stream.name).toBe("master");
    expect(stream.events.length).toBe(0);
    expect(stream.isEmpty()).toBe(true);
  });
});
