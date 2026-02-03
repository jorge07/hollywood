import EventStore from '../src/EventSourcing/EventStore';
import type DomainEvent from '../src/Domain/Event/DomainEvent';
import DomainMessage from '../src/Domain/Event/DomainMessage';
import DomainEventStream from '../src/Domain/Event/DomainEventStream';
import EventSourcedAggregateRoot from "../src/Domain/EventSourcedAggregateRoot";
import {AggregateRootId} from "../src/Domain/AggregateRoot";

export default class Scenario<T extends EventSourcedAggregateRoot> {

    private aggregateId = '1';
    private aggregateInstance?: T;

    constructor(
        private readonly aggregateFactory: new (aggregateRootId: AggregateRootId) => T,
        private readonly eventStore: EventStore<T>,
    ) {
    }

    public withAggregateId(aggregateId: string): Scenario<T> {
        this.aggregateId = aggregateId;

        return this;
    }

    public async given(events: DomainEvent[]):  Promise<void> {

        if (0 === events.length) {
            return;
        }

        const messages: DomainMessage[] = [];

        events.forEach(
            (event: DomainEvent, index: number) => {
                messages.push(DomainMessage.create(this.aggregateId, index, event, []));
            }
        )

        const stream = new DomainEventStream(messages);

        await this.eventStore.append(this.aggregateId, stream);

        this.aggregateInstance = (new this.aggregateFactory(this.aggregateId)).fromHistory(stream);
    }

    public when(callable: (aggregate?: T) => T): void {
        if (!callable) {
            return;
        }

        if (!this.aggregateInstance) {

            this.aggregateInstance = callable(this.aggregateInstance);

            return;
        }

        callable(this.aggregateInstance);
    }

    public then(thens: object[] | DomainEvent[]): void {

        expect(thens).toEqual(this.events())
    }

    private events(): object[] | DomainEvent[] {
        if (!this.aggregateInstance) {
            return [];
        }

        return this.aggregateInstance.getUncommittedEvents().events.map((message) => (message.event));
    }
}
