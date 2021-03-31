import type { interfaces } from "inversify";
import type { IService } from "../../Service";
export declare function IsCollectionType(serviceDefinition: IService): boolean;
export default function CollectionType(bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound): (key: string, serviceDefinition: IService) => void;
