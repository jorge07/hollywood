"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadModel = exports.Framework = exports.EventSourcing = exports.Domain = exports.Application = void 0;
const DomainEvent_1 = __importDefault(require("./src/Domain/Event/DomainEvent"));
const DomainEventStream_1 = __importDefault(require("./src/Domain/Event/DomainEventStream"));
const AggregateRoot_1 = __importDefault(require("./src/Domain/AggregateRoot"));
const DomainMessage_1 = __importDefault(require("./src/Domain/Event/DomainMessage"));
const Repository_1 = __importDefault(require("./src/Domain/Repository/Repository"));
const EventSourcedAggregateRoot_1 = __importDefault(require("./src/Domain/EventSourcedAggregateRoot"));
const EventSourced_1 = __importDefault(require("./src/Domain/EventSourced"));
const App_1 = __importDefault(require("./src/Application/App"));
const autowiring_1 = __importDefault(require("./src/Application/Bus/autowiring"));
const QueryBus_1 = __importDefault(require("./src/Application/Bus/Query/QueryBus"));
const CommandBus_1 = __importDefault(require("./src/Application/Bus/Command/CommandBus"));
const MissingAutowiringAnnotationException_1 = __importDefault(require("./src/Application/Bus/Exception/MissingAutowiringAnnotationException"));
const EventStore_1 = __importDefault(require("./src/EventStore/EventStore"));
const InMemoryEventStore_1 = __importDefault(require("./src/EventStore/InMemoryEventStore"));
const SnapshotStore_1 = __importDefault(require("./src/EventStore/Snapshot/SnapshotStore"));
const InMemorySnapshotStoreDBAL_1 = __importDefault(require("./src/EventStore/Snapshot/InMemorySnapshotStoreDBAL"));
const AggregateRootNotFoundException_1 = __importDefault(require("./src/EventStore/Exception/AggregateRootNotFoundException"));
const EventBus_1 = __importDefault(require("./src/EventStore/EventBus/EventBus"));
const EventListener_1 = __importDefault(require("./src/EventStore/EventBus/EventListener"));
const EventSubscriber_1 = __importDefault(require("./src/EventStore/EventBus/EventSubscriber"));
const Kernel_1 = __importDefault(require("./src/Framework/Kernel"));
const Alias_1 = require("./src/Framework/Container/Bridge/Alias");
const ContainerCompilationException_1 = __importDefault(require("./src/Framework/Container/Exception/ContainerCompilationException"));
const InMemoryReadModelRepository_1 = __importDefault(require("./src/ReadModel/InMemoryReadModelRepository"));
const Projector_1 = __importDefault(require("./src/ReadModel/Projector"));
const Application = {
    autowiring: autowiring_1.default,
    App: App_1.default,
    CommandBus: CommandBus_1.default,
    MissingAutowiringAnnotationException: MissingAutowiringAnnotationException_1.default,
    QueryBus: QueryBus_1.default,
};
exports.Application = Application;
const Domain = {
    AggregateRoot: AggregateRoot_1.default,
    DomainEvent: DomainEvent_1.default,
    DomainEventStream: DomainEventStream_1.default,
    DomainMessage: DomainMessage_1.default,
    EventListener: EventListener_1.default,
    EventSourced: EventSourced_1.default,
    EventSourcedAggregateRoot: EventSourcedAggregateRoot_1.default,
    Repository: Repository_1.default,
};
exports.Domain = Domain;
const EventSourcing = {
    AggregateRootNotFoundException: AggregateRootNotFoundException_1.default,
    EventBus: EventBus_1.default,
    EventListener: EventListener_1.default,
    EventStore: EventStore_1.default,
    EventSubscriber: EventSubscriber_1.default,
    InMemoryEventStore: InMemoryEventStore_1.default,
    SnapshotStore: SnapshotStore_1.default,
    InMemorySnapshotStoreDBAL: InMemorySnapshotStoreDBAL_1.default,
};
exports.EventSourcing = EventSourcing;
const Framework = {
    ContainerCompilationException: ContainerCompilationException_1.default,
    Kernel: Kernel_1.default,
    SERVICES_ALIAS: Alias_1.SERVICES_ALIAS,
    PARAMETERS_ALIAS: Alias_1.PARAMETERS_ALIAS,
};
exports.Framework = Framework;
const ReadModel = {
    InMemoryReadModelRepository: InMemoryReadModelRepository_1.default,
    Projector: Projector_1.default,
};
exports.ReadModel = ReadModel;
//# sourceMappingURL=index.js.map