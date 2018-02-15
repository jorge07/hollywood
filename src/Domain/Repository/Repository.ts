import { AggregateRoot } from '../AggregateRoot';

export interface Repository {
    save(aggregateRoot: AggregateRoot): void

    load(aggregateRootId: string): AggregateRoot
}
