import { AsyncContainerModule, decorate, injectable, interfaces, METADATA_KEY } from "inversify";
import type { IService, ServiceList } from "../Service";
import StandardType from "./Type/StandardType";
import CollectionType, {IsCollectionType} from "./Type/CollectionType";
import AsyncType, {IsAsyncType} from "./Type/AsyncType";
import CustomType, {IsCustomType} from "./Type/CustomType";
import EventStoreType, {IsEventStoreType} from "./Type/EventStoreType";
import ListenerType, {IsListenerType} from "./Type/ListenerType";

export function createContainerModule(serviceList: ServiceList): AsyncContainerModule {
    return new AsyncContainerModule(async (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
    ) => {
        for (const [key, serviceDefinition] of serviceList) {
            decorateService(serviceDefinition);
            switch(true) {
                case IsCollectionType(serviceDefinition):
                    CollectionType(bind)(key, serviceDefinition)
                    break;
                case IsAsyncType(serviceDefinition):
                    await AsyncType(bind)(key, serviceDefinition)
                    break;
                case IsCustomType(serviceDefinition):
                    CustomType(bind)(key, serviceDefinition)
                    break;
                case IsEventStoreType(serviceDefinition):
                    EventStoreType(bind)(key, serviceDefinition)
                    break;
                case IsListenerType(serviceDefinition):
                    ListenerType(bind)(key, serviceDefinition)
                    break;
                default:
                    StandardType(bind)(key, serviceDefinition);
            }
        }
    });
}

function decorateService(serviceDefinition: IService): void {
    if (serviceDefinition.instance
        && !Array.isArray(serviceDefinition.instance) // Can't decorate array wrap for collections
        && serviceDefinition.instance.name !== "" // Not decorate anon
        && !Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, serviceDefinition.instance) // Don't redecorate
    ) {
        decorate(injectable(), serviceDefinition.instance);
    }
}
