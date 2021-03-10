import type { interfaces } from "inversify";
import type { IService } from "../../Service";

export function IsAsyncType(serviceDefinition: IService): boolean {
    return !!serviceDefinition.async;
}

export default function AsyncType(
    rebind: interfaces.Rebind,
    isBound: interfaces.IsBound,
    bind: interfaces.Bind
) {
    return async (key: string, serviceDefinition: IService) => {
        if (serviceDefinition.async) {
            const service = await serviceDefinition.async();
            if (isBound(key)) {
                return rebind(key).toConstantValue(service);
            }
            bind(key).toConstantValue(service);
        }
    }
}
