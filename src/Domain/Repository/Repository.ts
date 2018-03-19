import { AggregateRoot } from "../AggregateRoot";
import EventSourced from '../AggregateRoot';

export default interface IRepository {
    save(aggregateRoot: EventSourced): void;

    load(aggregateRootId: string): EventSourced;
}
