import DomainEventStream from "../Domain/Event/DomainEventStream";

export default interface IEventStore {

    load(aggregateId: string): DomainEventStream;

    append(aggregateId: string, stream: DomainEventStream): void;
}
