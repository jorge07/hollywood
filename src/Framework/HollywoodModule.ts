import ModuleContext from "./Modules/ModuleContext";
import { ServiceList } from "./Container/Items/Service";
import { SERVICES_ALIAS } from "./Container/Bridge/Alias";
import EventBus from "../EventStore/EventBus/EventBus";
import InMemorySnapshotStoreDBAL from "../EventStore/Snapshot/InMemorySnapshotStoreDBAL";
import InMemoryEventStore from "../EventStore/InMemoryEventStore";

const HOLLYWOOD_SERVICES: ServiceList = new Map([
    // Application Layer
    [SERVICES_ALIAS.COMMAND_HANDLERS, { collection: [] }],
    [SERVICES_ALIAS.QUERY_HANDLERS, { collection: [] }],
    [SERVICES_ALIAS.COMMAND_MIDDLEWARE, { collection: [] }],
    [SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    // Infrastructure layer
    [SERVICES_ALIAS.DEFAULT_EVENT_BUS, { instance: EventBus }],
    [SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    [SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL, { instance: InMemorySnapshotStoreDBAL }],
    [SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL, { instance: InMemoryEventStore }],
]);

export const HollywoodModule: () => ModuleContext = function HollywoodModuleFactory() {
    return new ModuleContext({services: HOLLYWOOD_SERVICES});
};
