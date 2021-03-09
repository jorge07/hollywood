import type { interfaces } from "inversify";
import type {IService} from "../../Service";

export function IsCollectionType(serviceDefinition: IService): boolean {
    return !!serviceDefinition.collection;
}

export default function CollectionType(bind: interfaces.Bind) {
    return (key: string, serviceDefinition: IService): void => {
        if (serviceDefinition.collection?.length === 0) {
            // Empty null as marker of no content
            bind(key).toDynamicValue(() => null).inSingletonScope();
            return;
        }
        for (const item of serviceDefinition.collection || []) {
            bind(key).to(item).inSingletonScope();
        }
    }
}
