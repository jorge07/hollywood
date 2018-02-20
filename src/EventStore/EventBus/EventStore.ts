import { DomainEventStream } from '../../Domain/Event/DomainEventStream';

export interface EventStore {

    load(aggregateId: string): DomainEventStream

    append(aggregateId: string, stream: DomainEventStream): void
}
