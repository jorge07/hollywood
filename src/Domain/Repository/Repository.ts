import { AggregateRoot } from "../AggregateRoot";
import EventSourced from '../AggregateRoot';

export default interface IRepository<T extends EventSourced> {
    save(aggregateRoot: EventSourced): void;

    load(aggregateRootId: string): Promise<T>;
}
