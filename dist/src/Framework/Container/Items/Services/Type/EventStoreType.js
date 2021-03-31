"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsEventStoreType = void 0;
const EventStore_1 = __importDefault(require("../../../../../EventSourcing/EventStore"));
const Alias_1 = require("../../../Bridge/Alias");
function IsEventStoreType(serviceDefinition) {
    return !!serviceDefinition.eventStore;
}
exports.IsEventStoreType = IsEventStoreType;
function EventStoreType(rebind, isBound, bind) {
    return (key, serviceDefinition) => {
        if (serviceDefinition.eventStore !== undefined) {
            if (isBound(key)) {
                return rebind(key).toDynamicValue(eventStoreFactory(serviceDefinition)).inSingletonScope();
            }
            bind(key).toDynamicValue(eventStoreFactory(serviceDefinition)).inSingletonScope();
        }
    };
}
exports.default = EventStoreType;
function eventStoreFactory(serviceDefinition) {
    return ({ container }) => {
        return new EventStore_1.default(serviceDefinition.eventStore, container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL), container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_BUS), container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL), container.get(Alias_1.PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN));
    };
}
//# sourceMappingURL=EventStoreType.js.map