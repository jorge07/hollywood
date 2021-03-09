import DemoEvent from './DemoEvent';
import DomainEventStream from "../../../src/Domain/Event/DomainEventStream";
import DomainMessage from "../../../src/Domain/Event/DomainMessage";

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
