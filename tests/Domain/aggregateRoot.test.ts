import {AggregateRoot, DomainEvent, DomainMessage, DomainEventStream} from "../../src/Domain";

export class Dog extends AggregateRoot {
  private _id: string;
  wolfCount: number = 0;

  constructor(aggregateRootId: string) {
    super();
    this._id = aggregateRootId
  }

  getAggregateRootId(): string {

    return this._id
  }

  sayWolf(): string {
    super.raise(new SayWolf());

    return 'Wolf!'
  }

  applySayWolf(event: SayWolf) {
    this.wolfCount++
  }
}

export class SayWolf extends DomainEvent {

}

describe('AggregateRoot', () => {

  it('Aggregate Roots have an aggregate id', () => {
    const dog = new Dog(Math.random().toString());
    let stream = dog.getUncommitedEvents();

    expect(stream.events.length).toBe(0);
    expect(dog.wolfCount).toBe(0);

    expect(dog.sayWolf()).toBe('Wolf!');
    expect(dog.wolfCount).toBe(1);

    stream = dog.getUncommitedEvents();
    expect(stream.events.length).toBe(1)
  });

  it('Aggregate Roots must store events and call apply<DomainEventName> method if exist', () => {
    const dog = new Dog(Math.random().toString());
    let stream = dog.getUncommitedEvents();

    expect(stream.events.length).toBe(0);
    expect(dog.wolfCount).toBe(0);

    expect(dog.sayWolf()).toBe('Wolf!');
    expect(dog.wolfCount).toBe(1);

    stream = dog.getUncommitedEvents();
    expect(stream.events.length).toBe(1)
  });

  it('Aggregate Roots must be able to reconstruct from events history', () => {
    const dog = new Dog(Math.random().toString());
    const stream = new DomainEventStream([DomainMessage.create(dog.getAggregateRootId(), new SayWolf)]);

    const pluto = <Dog> dog.fromHistory(stream);

    expect(pluto.getUncommitedEvents().events.length).toBe(0);

    expect(pluto.wolfCount).toBe(1)
  })
});
