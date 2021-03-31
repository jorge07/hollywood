import { AggregateRootId } from "../AggregateRoot";
import DomainEvent from "./DomainEvent";
/**
 * @internal
 */
export default class DomainMessage {
    readonly uuid: AggregateRootId;
    readonly playhead: number;
    readonly event: object | DomainEvent;
    readonly metadata: any[];
    static create(uuid: AggregateRootId, playhead: number, event: object | DomainEvent, metadata?: any[]): DomainMessage;
    readonly occurred: Date;
    readonly eventType: string;
    private constructor();
    private static extractEventType;
}
