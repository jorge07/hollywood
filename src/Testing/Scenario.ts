import EventStore from '../EventSourcing/EventStore';
import type DomainEvent from '../Domain/Event/DomainEvent';
import DomainMessage from '../Domain/Event/DomainMessage';
import DomainEventStream from '../Domain/Event/DomainEventStream';
import EventSourcedAggregateRoot from "../Domain/EventSourcedAggregateRoot";
import { Identity } from "../Domain/AggregateRoot";

/**
 * BDD-style scenario testing utility for event-sourced aggregates.
 *
 * Provides a fluent interface for writing Given-When-Then style tests:
 * - `given()`: Sets up initial aggregate state from historical events
 * - `when()`: Executes a command or operation on the aggregate
 * - `then()`: Asserts expected domain events were raised
 *
 * @typeParam T - The event-sourced aggregate root type being tested
 *
 * @example
 * ```typescript
 * const scenario = new Scenario(Order, eventStore);
 *
 * await scenario
 *   .withAggregateId('order-123')
 *   .given([new OrderCreated('order-123')])
 *
 * scenario.when((order) => {
 *   order.cancel();
 *   return order;
 * });
 *
 * scenario.then([new OrderCancelled('order-123')]);
 * ```
 */
export default class Scenario<T extends EventSourcedAggregateRoot> {

    private aggregateId: Identity = Identity.fromString('00000000-0000-4000-8000-000000000001');
    private aggregateInstance?: T;

    /**
     * Creates a new test scenario for an event-sourced aggregate.
     *
     * @param aggregateFactory - Constructor function for the aggregate root
     * @param eventStore - EventStore instance (typically created with createTestEventStore)
     */
    constructor(
        private readonly aggregateFactory: new (aggregateRootId: Identity) => T,
        private readonly eventStore: EventStore<T>,
    ) {
    }

    /**
     * Sets the aggregate ID for this test scenario.
     * Call this before `given()` to test a specific aggregate instance.
     * Accepts either a UUID string or an Identity instance for convenience.
     *
     * @param aggregateId - The aggregate root identifier (string UUID or Identity)
     * @returns This scenario instance for method chaining
     */
    public withAggregateId(aggregateId: string | Identity): Scenario<T> {
        this.aggregateId = typeof aggregateId === 'string'
            ? Identity.fromString(aggregateId)
            : aggregateId;

        return this;
    }

    /**
     * Sets up the initial state of the aggregate from historical events (Given).
     * Events are appended to the event store and replayed to reconstitute the aggregate.
     *
     * @param events - Array of domain events representing the aggregate's history
     */
    public async given(events: DomainEvent[]):  Promise<void> {

        if (0 === events.length) {
            return;
        }

        const messages: DomainMessage[] = [];

        events.forEach(
            (event: DomainEvent, index: number) => {
                messages.push(DomainMessage.create(this.aggregateId.toString(), index, event, []));
            }
        )

        const stream = new DomainEventStream(messages);

        await this.eventStore.append(this.aggregateId.toString(), stream);

        this.aggregateInstance = (new this.aggregateFactory(this.aggregateId)).fromHistory(stream);
    }

    /**
     * Executes a command or operation on the aggregate (When).
     * The callable receives the aggregate instance (or undefined for new aggregates)
     * and must return the aggregate after applying changes.
     *
     * @param callable - Function that executes the command/operation on the aggregate
     */
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

    /**
     * Asserts that the expected domain events were raised (Then).
     * Compares the uncommitted events from the aggregate against the expected events.
     *
     * @param thens - Array of expected domain events
     */
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
