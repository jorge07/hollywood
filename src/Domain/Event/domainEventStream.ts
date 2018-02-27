import { AggregateRoot } from "../AggregateRoot";
import { DomainMessage } from "./DomainMessage";

export class DomainEventStream {
    constructor(
        public events: DomainMessage[] = [],
        public name: string = "master",
    ) {}
}
