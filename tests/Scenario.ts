import EventStore from '../src/EventStore/EventStore';
import EventSourced from '../src/Domain/EventSourced';
import DomainEvent from '../src/Domain/Event/DomainEvent';
import DomainMessage from '../src/Domain/Event/DomainMessage';
import DomainEventStream from '../src/Domain/Event/DomainEventStream';
import type { AggregateRootId } from '../src/Domain/AggregateRoot';

export default class Scenario <T extends EventSourced> {

    private aggregateId = '1';
    private aggregateInstance?: T;

    constructor(
        private readonly aggregateFactory: new (aggregateRootId: AggregateRootId) => T,
        private readonly eventStore: EventStore<T>,
    ) {}

    public withAggregateId(aggregateId: string): Scenario<T>
    {
        this.aggregateId = aggregateId;

        return this;
    }

    public given(events: DomainEvent[]): Scenario<T> {

        if (0 === events.length) {
            return this;
        }

        const messages: DomainMessage[] = [];

        events.forEach(
            (event: DomainEvent, index: number) => {
                messages.push(DomainMessage.create(this.aggregateId, index, event, []));
            }
        )

        const stream = new DomainEventStream(messages);

        this.eventStore.append(this.aggregateId, stream);

        this.aggregateInstance = (new this.aggregateFactory(this.aggregateId)).fromHistory(stream);

        return this;
    }

    public when(callable: (aggregate?: T) => T): Scenario<T> {
        if (! callable) {
            return this;
        }

        if (! this.aggregateInstance) {

            this.aggregateInstance = callable(this.aggregateInstance);

            return this
        }

        callable(this.aggregateInstance);

        return this;
    }

    public then(thens: object[]|DomainEvent[]): Scenario<T> {

        expect(thens).toEqual(this.events())

        return this;
    }

    private events(): object[]|DomainEvent[] {
        if (! this.aggregateInstance) {
            return [];
        }

        return this.aggregateInstance.getUncommitedEvents().events.map((message)=>(message.event));
    }
}
