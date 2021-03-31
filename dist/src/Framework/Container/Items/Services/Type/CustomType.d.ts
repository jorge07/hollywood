import type { interfaces } from "inversify";
import type { IService } from "../../Service";
export declare function IsCustomType(serviceDefinition: IService): boolean;
export default function CustomType(rebind: interfaces.Rebind, isBound: interfaces.IsBound, bind: interfaces.Bind): (key: string, serviceDefinition: IService) => interfaces.BindingWhenOnSyntax<unknown> | undefined;
