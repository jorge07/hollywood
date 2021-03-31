import type { IService } from "../../Service";
import type { interfaces } from "inversify";
export default function StandardType(rebind: interfaces.Rebind, isBound: interfaces.IsBound, bind: interfaces.Bind): (key: string, serviceDefinition: IService) => void;
