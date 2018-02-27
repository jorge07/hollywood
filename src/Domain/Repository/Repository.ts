import { AggregateRoot } from "../AggregateRoot";

export interface IRepository {
    save(aggregateRoot: AggregateRoot): void;

    load(aggregateRootId: string): AggregateRoot;
}
