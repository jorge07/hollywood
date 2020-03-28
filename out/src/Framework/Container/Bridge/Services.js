"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventBus_1 = __importDefault(require("../../../EventStore/EventBus/EventBus"));
const InMemoryEventStore_1 = __importDefault(require("../../../EventStore/InMemoryEventStore"));
const AppBridge_1 = __importDefault(require("../../AppBridge"));
const Alias_1 = require("./Alias");
const InMemorySnapshotStoreDBAL_1 = __importDefault(require("../../../EventStore/Snapshot/InMemorySnapshotStoreDBAL"));
exports.LIST = new Map([
    // Application Layer
    [Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.QUERY_HANDLERS, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.COMMAND_MIDDLEWARE, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    // Infrastructure layer
    [Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_BUS, { instance: EventBus_1.default }],
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL, { instance: InMemoryEventStore_1.default }],
    [Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL, { instance: InMemorySnapshotStoreDBAL_1.default }],
    [Alias_1.SERVICES_ALIAS.APP_BRIDGE, { instance: AppBridge_1.default }],
]);
//# sourceMappingURL=Services.js.map