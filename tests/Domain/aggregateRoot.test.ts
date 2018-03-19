import { EventSourced, DomainEvent, DomainEventStream, DomainMessage } from "../../src/Domain";

export class Dog extends EventSourced {
  public wolfCount: number = 0;
  private id: string;

  constructor(aggregateRootId: string) {
    super();
    this.id = aggregateRootId;
  }

  public getAggregateRootId(): string {

    return this.id;
  }

  public sayWolf(): string {
    super.raise(new SayWolf());

    return "Wolf!";
  }

  public applySayWolf(event: SayWolf) {
    this.wolfCount++;
  }
}

export class SayWolf extends DomainEvent {

}

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
    const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), new SayWolf())]);

    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
  });
});
