import type {IService} from "../../Service";
import type {interfaces} from "inversify";

export default function StandardType(
    rebind: interfaces.Rebind,
    isBound: interfaces.IsBound,
    bind: interfaces.Bind
) {
    return (key: string, serviceDefinition: IService) => {
        if (isBound(key)) {
            rebind(key).to(serviceDefinition.instance).inSingletonScope();
        }
        bind(key).to(serviceDefinition.instance).inSingletonScope();
    }
}
