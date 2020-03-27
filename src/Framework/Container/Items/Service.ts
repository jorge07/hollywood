import { interfaces } from "inversify";

type UniqueServiceIdentifier = string;

export interface IListener {
    bus: string;
    listener?: boolean;
}

export type Subscriber = IListener & {
    subscriber: any[],
};

export interface IService extends Partial<Subscriber> {
    instance?: any;
    collection?: any[];
    custom?: (context: interfaces.Context) => any;
    async?: () => any;
    constant?: boolean;
}

export type ServiceList = Map<UniqueServiceIdentifier, IService>;