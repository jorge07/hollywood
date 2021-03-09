import type {IService} from "../../Service";
import type {interfaces} from "inversify";

export default function StandardType(bind: interfaces.Bind) {
    return (key: string, serviceDefinition: IService) => bind(key).to(serviceDefinition.instance).inSingletonScope();
}
