import { AsyncContainerModule, decorate, injectable, interfaces, METADATA_KEY } from "inversify";
import { isArray } from "util";
import { IService, ServiceList } from "../Items/Service";

export default function addModules(serviceList: ServiceList, modules: AsyncContainerModule[]): void {
    for (const serviceDefinitionItem of serviceList) {
        modules.push(module(serviceDefinitionItem[1], serviceDefinitionItem[0]));
    }
}

function module(serviceDefinition: IService, key: string): AsyncContainerModule {
    return new AsyncContainerModule(async (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
    ) => {
        decorateService(serviceDefinition);

        switch(true) {
            case Boolean(serviceDefinition.collection):
                processCollection(serviceDefinition.collection as any[], key, bind)
                break;
            case Boolean(serviceDefinition.async):
                await processAsync(serviceDefinition.async as () => any, key, bind)
                break;
            case Boolean(serviceDefinition.custom):
                processCustom(serviceDefinition.custom as (context: interfaces.Context) => any, key, bind)
                break;
            default:
                bind(key).to(serviceDefinition.instance).inSingletonScope();
        }
    });
}

function decorateService(serviceDefinition: IService): void {
    if (serviceDefinition.instance
        && !isArray(serviceDefinition.instance) // Can't decorate array wrap for collections
        && serviceDefinition.instance.name !== "" // Not decorate anon
        && !Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, serviceDefinition.instance) // Don't redecorate
    ) {
        decorate(injectable(), serviceDefinition.instance);
    }
}

function processCollection(collection: any[], key: string, bind: interfaces.Bind): void {
    if (collection.length === 0) {
        // Empty aray as marker of no content
        bind(key).toDynamicValue(() => []).inSingletonScope();
        return;
    }

    collection.forEach((item: any) => {
        bind(key).to(item).inSingletonScope();
    });
}

async function processAsync(asyncFunc: () => any, key: string, bind: interfaces.Bind): Promise<void> {
    const service = await asyncFunc();
    bind(key).toConstantValue(service);
}

function processCustom(custom: (context: interfaces.Context) => any, key: string, bind: interfaces.Bind): void {
    bind(key).toDynamicValue(custom).inSingletonScope();
}

