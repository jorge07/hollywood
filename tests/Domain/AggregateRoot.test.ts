import { DomainEvent, DomainEventStream, DomainMessage, EventSourced } from "../../src/Domain";

export class Dog extends EventSourced {
  public wolfCount: number = 0;
  private id: string;

  constructor() {
    super();

    this.registerChild(new VoiceRecorder())
  }

  public getAggregateRootId(): string {

    return this.id;
  }

  public sayWolf(): string {
    super.raise(new SayWolf(Math.random().toString()));

    return "Wolf!";
  }

  public sayGrr(): string {
    super.raise(new SayGrr(Math.random().toString()));

    return "Grr!";
  }

  public applySayWolf(event: SayWolf) {
    this.id = event.uuid;
    this.wolfCount++;
  }

  public records(): string[] {
    const recorder: VoiceRecorder = this.aggregates[0] as any;

    return recorder.recorded;
  }
}

class VoiceRecorder extends EventSourced {
  private id: string = '41';
  public recorded: string[] = [];
  constructor() {
    super();
  }

  public getAggregateRootId(): string {

    return this.id;
  }

  public applySayWolf(event: SayWolf) {
    this.recorded.push('Wolf');
  }
}

export class SayWolf extends DomainEvent {
  constructor(public readonly uuid: string) {
    super();
  }
}

export class SayGrr extends DomainEvent {
  constructor(public readonly uuid: string) {
    super();
  }
}

describe("AggregateRoot", () => {

  it("Aggregate Roots must store events and call apply<DomainEventName> method if exist", () => {
    const dog = new Dog();
    let stream = dog.getUncommitedEvents();

    expect(stream.events.length).toBe(0);
    expect(dog.wolfCount).toBe(0);

    expect(dog.sayWolf()).toBe("Wolf!");
    expect(dog.wolfCount).toBe(1);
    expect(dog.records().length).toBe(1);

    stream = dog.getUncommitedEvents();
    expect(stream.events.length).toBe(1);
  });

  it("Aggregate Roots must be able to reconstruct from stringified events", () => {

    const dog = new Dog();
    const domainMessage: string = JSON.stringify(DomainMessage.create(dog.getAggregateRootId(), 1, new SayWolf('asd')));
    const stream = new DomainEventStream([JSON.parse(domainMessage) as DomainMessage]);
    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
    expect(dog.records().length).toBe(1);
  });

  it("Aggregate Roots must be able to reconstruct from events history", () => {
    const dog = new Dog();
    const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), 1, new SayWolf('asd'))]);

    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
  });

  it("Aggregate Roots can have tree dependencies", () => {
    const dog = new Dog();

    const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), 1, new SayWolf('asd'))]);

    const pluto = dog.fromHistory(stream) as Dog;

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1);
  });
});
