import type DomainMessage from "./DomainMessage";
import type { StreamName } from "./StreamName";

export default class DomainEventStream {
    constructor(
        public readonly events: DomainMessage[] = [],
        public readonly name: StreamName = "master",
    ) {}

    public isEmpty(): boolean {
        return 0 === this.events.length;
    }
}
