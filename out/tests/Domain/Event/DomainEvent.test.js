"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Domain_1 = require("../../../src/Domain");
class DemoEvent extends Domain_1.DomainEvent {
}
describe("DomainEvent", () => {
    it("DomainEvent must record when occurs and get child class name", () => {
        const event = new DemoEvent();
        expect(event.ocurrendOn).toBeDefined();
    });
});
//# sourceMappingURL=DomainEvent.test.js.map