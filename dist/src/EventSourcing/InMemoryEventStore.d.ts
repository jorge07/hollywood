import IEventStoreDBAL from "./IEventStoreDBAL";
import DomainEventStream from "../Domain/Event/DomainEventStream";
export default class InMemoryEventStore implements IEventStoreDBAL {
    private readonly events;
    load(aggregateId: string, from?: number): Promise<DomainEventStream>;
    loadFromTo(aggregateId: string, from?: number, to?: number): Promise<DomainEventStream>;
    append(aggregateId: string, stream: DomainEventStream): void;
}
