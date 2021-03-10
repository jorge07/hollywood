import type {interfaces} from "inversify";
import type {IService} from "../../Service";

export function IsCustomType(serviceDefinition: IService): boolean {
    return !!serviceDefinition.custom;
}

export default function CustomType(
    rebind: interfaces.Rebind,
    isBound: interfaces.IsBound,
    bind: interfaces.Bind
) {
    return (key: string, serviceDefinition: IService) => {
        if (serviceDefinition.custom) {
            if (isBound(key)) {
                return rebind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
            }
            bind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
        }
    }
}
