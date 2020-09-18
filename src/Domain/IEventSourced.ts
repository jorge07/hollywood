import {DomainEvent} from "./index";

export default interface IEventSourced {
    fromSnapshot(snapshot: IEventSourced): IEventSourced;
    recursiveHandling(event: object|DomainEvent, method: string): void;
}
