import type DomainEvent from '../../../src/Domain/Event/DomainEvent';

export default class DemoEvent implements DomainEvent {
    constructor(
        public readonly aggregateId: string = 'test-aggregate',
        public readonly occurredAt: Date = new Date()
    ) {}
}
