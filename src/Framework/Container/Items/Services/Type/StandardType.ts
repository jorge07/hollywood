import type {IService} from "../../Service";
import type {interfaces} from "inversify";

export default function StandardType(
    rebind: interfaces.Rebind,
    isBound: interfaces.IsBound,
    bind: interfaces.Bind
) {
    return (key: string, serviceDefinition: IService) => {
        if (!serviceDefinition.instance) {
            throw new Error(`StandardType service '${key}' requires an instance property`);
        }
        if (isBound(key)) {
            rebind(key).to(serviceDefinition.instance).inSingletonScope();
        } else {
            bind(key).to(serviceDefinition.instance).inSingletonScope();
        }
    }
}
