"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Domain_1 = require("../../src/Domain");
class Dog extends Domain_1.EventSourced {
    constructor(aggregateRootId) {
        super();
        this.wolfCount = 0;
        this.id = aggregateRootId;
    }
    getAggregateRootId() {
        return this.id;
    }
    sayWolf() {
        super.raise(new SayWolf());
        return "Wolf!";
    }
    applySayWolf(event) {
        this.wolfCount++;
    }
}
exports.Dog = Dog;
class SayWolf extends Domain_1.DomainEvent {
}
exports.SayWolf = SayWolf;
describe("AggregateRoot", () => {
    it("Aggregate Roots have an aggregate id", () => {
        const dog = new Dog(Math.random().toString());
        let stream = dog.getUncommitedEvents();
        expect(stream.events.length).toBe(0);
        expect(dog.wolfCount).toBe(0);
        expect(dog.sayWolf()).toBe("Wolf!");
        expect(dog.wolfCount).toBe(1);
        stream = dog.getUncommitedEvents();
        expect(stream.events.length).toBe(1);
    });
    it("Aggregate Roots must store events and call apply<DomainEventName> method if exist", () => {
        const dog = new Dog(Math.random().toString());
        let stream = dog.getUncommitedEvents();
        expect(stream.events.length).toBe(0);
        expect(dog.wolfCount).toBe(0);
        expect(dog.sayWolf()).toBe("Wolf!");
        expect(dog.wolfCount).toBe(1);
        stream = dog.getUncommitedEvents();
        expect(stream.events.length).toBe(1);
    });
    it("Aggregate Roots must be able to reconstruct from events history", () => {
        const dog = new Dog(Math.random().toString());
        const stream = new Domain_1.DomainEventStream([Domain_1.DomainMessage.create(dog.getAggregateRootId(), new SayWolf())]);
        const pluto = dog.fromHistory(stream);
        expect(pluto.getUncommitedEvents().events.length).toBe(0);
        expect(pluto.wolfCount).toBe(1);
    });
});
//# sourceMappingURL=AggregateRoot.test.js.map