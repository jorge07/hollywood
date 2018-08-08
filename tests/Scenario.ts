import EventStore from '../src/EventStore/EventStore';
import EventSourced from '../src/Domain/EventSourced';
import CommandBus from '../src/Application/Bus/Command/CommandBus';
import DomainEvent from '../src/Domain/Event/DomainEvent';
import DomainMessage from '../src/Domain/Event/DomainMessage';
import DomainEventStream from '../src/Domain/Event/DomainEventStream';

export default class Scenario <T extends EventSourced> {

    private aggregateId = '1';
    private aggregateInstance: T

    constructor(
        private readonly aggregateFactory: new () => T,
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

        const messages = [];

        events.forEach(
            (event: DomainEvent, index: number) => {
                messages.push(DomainMessage.create(this.aggregateId, index, event, []));
            }
        )

        const stream = new DomainEventStream(messages);

        this.eventStore.append(this.aggregateId, stream);

        this.aggregateInstance = (new this.aggregateFactory()).fromHistory(stream);

        return this;
    }

    public when(when: (aggregate?: T) => T): Scenario<T> {
        if (! when) {
            return this;
        }

        if (! this.aggregateInstance) {

            this.aggregateInstance = when(this.aggregateInstance);

            return this
        }

        when(this.aggregateInstance);

        return this;
    }

    public then(thens: DomainEvent[]): Scenario<T> {

        expect(thens).toEqual(this.events())

        return this;
    }

    private events(): DomainEvent[] {

        return this.aggregateInstance.getUncommitedEvents().events.map((message)=>(message.event));
    }
}