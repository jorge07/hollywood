import DomainEvent from "./Event/DomainEvent";

export default interface IEventSourced {
    fromSnapshot(snapshot: IEventSourced): IEventSourced;
    recursiveHandling(event: object|DomainEvent, method: string): void;
}
