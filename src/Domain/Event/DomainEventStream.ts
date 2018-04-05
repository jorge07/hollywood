import AggregateRoot from "../AggregateRoot";
import DomainMessage from "./DomainMessage";
import { StreamName } from "./StreamName";

export default class DomainEventStream {
    constructor(
        public readonly events: DomainMessage[] = [],
        public readonly name: StreamName = "master",
    ) {
    }

    public isEmpty(): boolean {
        return 0 === this.events.length;
    }
}
