"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HollywoodModule = void 0;
const ModuleContext_1 = __importDefault(require("./Modules/ModuleContext"));
const Alias_1 = require("./Container/Bridge/Alias");
const EventBus_1 = __importDefault(require("../EventStore/EventBus/EventBus"));
const InMemorySnapshotStoreDBAL_1 = __importDefault(require("../EventStore/Snapshot/InMemorySnapshotStoreDBAL"));
const InMemoryEventStore_1 = __importDefault(require("../EventStore/InMemoryEventStore"));
const HOLLYWOOD_SERVICES = new Map([
    // Application Layer
    [Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.QUERY_HANDLERS, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.COMMAND_MIDDLEWARE, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    // Infrastructure layer
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_BUS, { instance: EventBus_1.default }],
    [Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL, { instance: InMemorySnapshotStoreDBAL_1.default }],
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL, { instance: InMemoryEventStore_1.default }],
]);
exports.HollywoodModule = function HollywoodModuleFactory() {
    return new ModuleContext_1.default({ services: HOLLYWOOD_SERVICES });
};
//# sourceMappingURL=HollywoodModule.js.map