import DomainEvent from "./src/Domain/Event/DomainEvent";
import DomainEventStream from "./src/Domain/Event/DomainEventStream";
import AggregateRoot from "./src/Domain/AggregateRoot";
import DomainMessage from "./src/Domain/Event/DomainMessage";
import Repository from "./src/Domain/Repository/Repository";
import EventSourcedAggregateRoot from "./src/Domain/EventSourcedAggregateRoot";
import EventSourced from "./src/Domain/EventSourced";
import App from "./src/Application/App";
import autowiring from "./src/Application/Bus/autowiring";
import QueryBus from "./src/Application/Bus/Query/QueryBus";
import CommandBus from "./src/Application/Bus/Command/CommandBus";
import MissingAutowiringAnnotationException from "./src/Application/Bus/Exception/MissingAutowiringAnnotationException";
import EventStore from "./src/EventStore/EventStore";
import InMemoryEventStore from "./src/EventStore/InMemoryEventStore";
import SnapshotStore from "./src/EventStore/Snapshot/SnapshotStore";
import InMemorySnapshotStoreDBAL from "./src/EventStore/Snapshot/InMemorySnapshotStoreDBAL";
import AggregateRootNotFoundException from "./src/EventStore/Exception/AggregateRootNotFoundException";
import EventBus from "./src/EventStore/EventBus/EventBus";
import EventListener from "./src/EventStore/EventBus/EventListener";
import EventSubscriber from "./src/EventStore/EventBus/EventSubscriber";
import Kernel from "./src/Framework/Kernel";
import {PARAMETERS_ALIAS, SERVICES_ALIAS} from "./src/Framework/Container/Bridge/Alias";
import ContainerCompilationException from "./src/Framework/Container/Exception/ContainerCompilationException";
import InMemoryReadModelRepository from "./src/ReadModel/InMemoryReadModelRepository";
import Projector from "./src/ReadModel/Projector";

const Application = {
    autowiring,
    App,
    CommandBus,
    MissingAutowiringAnnotationException,
    QueryBus,
}
const Domain = {
    AggregateRoot,
    DomainEvent,
    DomainEventStream,
    DomainMessage,
    EventListener,
    EventSourced,
    EventSourcedAggregateRoot,
    Repository,
}

const EventSourcing = {
    AggregateRootNotFoundException,
    EventBus,
    EventListener,
    EventStore,
    EventSubscriber,
    InMemoryEventStore,
    SnapshotStore,
    InMemorySnapshotStoreDBAL,
}

const Framework = {
    ContainerCompilationException,
    Kernel,
    SERVICES_ALIAS,
    PARAMETERS_ALIAS,
}

const ReadModel = {
    InMemoryReadModelRepository,
    Projector,
}

export {
    Application,
    Domain,
    EventSourcing,
    Framework,
    ReadModel
};
