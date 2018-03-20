"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Domain_1 = require("../../../src/Domain");
class DemoEvent extends Domain_1.DomainEvent {
}
describe("DomainEventStream", () => {
    it("DomainEvent wrap events collection", () => {
        const domainMessage = Domain_1.DomainMessage.create("asdasd", new DemoEvent());
        const stream = new Domain_1.DomainEventStream([domainMessage]);
        expect(stream.events.length).toBe(1);
    });
});
//# sourceMappingURL=DomainEventStream.test.js.map