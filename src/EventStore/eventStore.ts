import { DomainEventStream } from '../Domain/Event/DomainEventStream';

export interface EventStore {

    load(aggregateId: string): any

    append(aggregateId: string, stream: DomainEventStream): void
}
