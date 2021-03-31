"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AggregateRootNotFoundException_1 = __importDefault(require("./Exception/AggregateRootNotFoundException"));
const SnapshotStore_1 = __importDefault(require("./Snapshot/SnapshotStore"));
const MIN_SNAPSHOT_MARGIN = 10;
class EventStore {
    constructor(modelConstructor, dbal, eventBus, snapshotStoreDbal, snapshotMargin) {
        this.modelConstructor = modelConstructor;
        this.dbal = dbal;
        this.eventBus = eventBus;
        this.snapshotMargin = snapshotMargin || MIN_SNAPSHOT_MARGIN;
        if (snapshotStoreDbal) {
            this.snapshotStore = new SnapshotStore_1.default(snapshotStoreDbal);
        }
    }
    async load(aggregateRootId) {
        let aggregateRoot;
        aggregateRoot = await this.fromSnapshot(aggregateRootId);
        const stream = await this.dbal.load(aggregateRootId, aggregateRoot ? aggregateRoot.version() : 0);
        EventStore.emptyStream(stream);
        aggregateRoot = aggregateRoot || this.aggregateFactory(aggregateRootId);
        return aggregateRoot.fromHistory(stream);
    }
    async save(entity) {
        const stream = entity.getUncommittedEvents();
        await this.append(entity.getAggregateRootId(), stream);
        await this.takeSnapshot(entity);
        for (const message of stream.events) {
            await this.eventBus.publish(message);
        }
    }
    async append(aggregateId, stream) {
        await this.dbal.append(aggregateId, stream);
    }
    async replayFrom(uuid, from, to) {
        const replayStream = await this.dbal.loadFromTo(uuid, from, to);
        for (const message of replayStream.events) {
            await this.eventBus.publish(message);
        }
    }
    async takeSnapshot(entity) {
        if (this.snapshotStore && this.isSnapshotNeeded(entity.version())) {
            await this.snapshotStore.snapshot(entity);
        }
    }
    isSnapshotNeeded(version) {
        return version !== 0 && version / this.snapshotMargin >= 1 && version % this.snapshotMargin === 0;
    }
    async fromSnapshot(aggregateRootId) {
        if (!this.snapshotStore) {
            return null;
        }
        const snapshot = await this.snapshotStore.retrieve(aggregateRootId);
        if (!snapshot) {
            return null;
        }
        const aggregateRoot = this.aggregateFactory(aggregateRootId);
        aggregateRoot.fromSnapshot(snapshot);
        return aggregateRoot;
    }
    aggregateFactory(aggregateRootId) {
        return new this.modelConstructor(aggregateRootId);
    }
    static emptyStream(stream) {
        if (stream.isEmpty()) {
            throw new AggregateRootNotFoundException_1.default();
        }
    }
}
exports.default = EventStore;
//# sourceMappingURL=EventStore.js.map