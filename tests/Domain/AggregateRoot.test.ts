import { DomainEvent, DomainEventStream, DomainMessage, EventSourced } from "../../src/Domain";

export class Dog extends EventSourced {
  public wolfCount: number = 0;
  private id: string;

  constructor() {
    super();
  }

  public getAggregateRootId(): string {

    return this.id;
  }

  public sayWolf(): string {
    super.raise(new SayWolf(Math.random().toString()));

    return "Wolf!";
  }

  public applySayWolf(event: SayWolf) {
    this.id = event.uuid;
    this.wolfCount++;
  }
}

export class SayWolf extends DomainEvent {
  constructor(public readonly uuid: string) {
    super();
  }
}

describe("AggregateRoot", () => {

  it("Aggregate Roots have an aggregate id", () => {
    const dog = new Dog();
    let stream = dog.getUncommitedEvents();

    expect(stream.events.length).toBe(0);
    expect(dog.wolfCount).toBe(0);

    expect(dog.sayWolf()).toBe("Wolf!");
    expect(dog.wolfCount).toBe(1);

    stream = dog.getUncommitedEvents();
    expect(stream.events.length).toBe(1);
  });

  it("Aggregate Roots must store events and call apply<DomainEventName> method if exist", () => {
    const dog = new Dog();
    let stream = dog.getUncommitedEvents();

    expect(stream.events.length).toBe(0);
    expect(dog.wolfCount).toBe(0);

    expect(dog.sayWolf()).toBe("Wolf!");
    expect(dog.wolfCount).toBe(1);

    stream = dog.getUncommitedEvents();
    expect(stream.events.length).toBe(1);
  });

  it("Aggregate Roots must be able to reconstruct from stringified events", () => {

    const dog = new Dog();
    const domainMessage: string = JSON.stringify(DomainMessage.create(dog.getAggregateRootId(), new SayWolf()));
    const stream = new DomainEventStream([JSON.parse(domainMessage) as DomainMessage]);
    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
  });

  it("Aggregate Roots must be able to reconstruct from events history", () => {
    const dog = new Dog();
    const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), new SayWolf())]);

    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
  });
});
