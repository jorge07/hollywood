import type { interfaces } from "inversify";
import type { AggregateFactory } from '../../../EventSourcing/EventStore';
declare type UniqueServiceIdentifier = string;
export interface IListener {
    bus: string;
    listener?: boolean;
}
export declare type Subscriber = IListener & {
    subscriber: any[];
};
export interface IService extends Partial<Subscriber> {
    instance?: any;
    collection?: any[];
    custom?: (context: interfaces.Context) => any;
    eventStore?: AggregateFactory<any>;
    async?: () => any;
    constant?: boolean;
    overwrite?: boolean;
}
export declare type ServiceList = Map<UniqueServiceIdentifier, IService>;
export {};
