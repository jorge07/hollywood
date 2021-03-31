import type { interfaces } from "inversify";
import type { IService } from "../../Service";
export declare function IsListenerType(serviceDefinition: IService): boolean;
export default function ListenerType(bind: interfaces.Bind, unbind: interfaces.Rebind, isBound: interfaces.IsBound): (key: string, serviceDefinition: IService) => void;
export declare function BindListeners(container: interfaces.Container): void;
