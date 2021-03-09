import type {interfaces} from "inversify";
import EventStore, {AggregateFactory} from "../../../../../EventSourcing/EventStore";
import {PARAMETERS_ALIAS, SERVICES_ALIAS} from "../../../Bridge/Alias";
import type {IService} from "../../Service";

export function IsEventStoreType(serviceDefinition: IService): boolean {
    return !!serviceDefinition.eventStore;
}

export default function EventStoreType(bind: interfaces.Bind) {
    return (key: string, serviceDefinition: IService) => {
        if (serviceDefinition.eventStore !== undefined) {
            bind(key).toDynamicValue(({container}: interfaces.Context) =>  {
                return new EventStore(
                    serviceDefinition.eventStore as AggregateFactory<any>,
                    container.get(SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL),
                    container.get(SERVICES_ALIAS.DEFAULT_EVENT_BUS),
                    container.get(SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL),
                    container.get(PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN),
                )
            }).inSingletonScope();
        }
    }
}
