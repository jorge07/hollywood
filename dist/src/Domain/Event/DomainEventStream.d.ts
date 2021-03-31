import type DomainMessage from "./DomainMessage";
import type { StreamName } from "./StreamName";
export default class DomainEventStream {
    readonly events: DomainMessage[];
    readonly name: StreamName;
    constructor(events?: DomainMessage[], name?: StreamName);
    isEmpty(): boolean;
}
