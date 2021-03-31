import type { interfaces } from "inversify";
import type { IService } from "../../Service";
export declare function IsAsyncType(serviceDefinition: IService): boolean;
export default function AsyncType(rebind: interfaces.Rebind, isBound: interfaces.IsBound, bind: interfaces.Bind): (key: string, serviceDefinition: IService) => Promise<interfaces.BindingWhenOnSyntax<unknown> | undefined>;
