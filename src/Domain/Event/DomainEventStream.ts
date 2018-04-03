import { AggregateRoot } from "../AggregateRoot";
import DomainMessage from "./DomainMessage";

export default class DomainEventStream {
    constructor(
        public readonly events: DomainMessage[] = [],
        public readonly name: string = "master",
    ) {
    }
}
