import type { interfaces } from "inversify";
import type { IService } from "../../Service";
export declare function IsEventStoreType(serviceDefinition: IService): boolean;
export default function EventStoreType(rebind: interfaces.Rebind, isBound: interfaces.IsBound, bind: interfaces.Bind): (key: string, serviceDefinition: IService) => interfaces.BindingWhenOnSyntax<unknown> | undefined;
