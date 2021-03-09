import type {interfaces} from "inversify";
import type {IService} from "../../Service";

export function IsCustomType(serviceDefinition: IService): boolean {
    return !!serviceDefinition.custom;
}

export default function CustomType(bind: interfaces.Bind) {
    return (key: string, serviceDefinition: IService) => {
        if (serviceDefinition.custom) {
            bind(key).toDynamicValue(serviceDefinition.custom).inSingletonScope();
        }
    }
}
