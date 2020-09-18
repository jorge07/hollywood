"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    load(aggregateRootId) {
        return __awaiter(this, void 0, void 0, function* () {
            let aggregateRoot = null;
            aggregateRoot = yield this.fromSnapshot(aggregateRootId);
            const stream = yield this.dbal.load(aggregateRootId, aggregateRoot ? aggregateRoot.version() : 0);
            this.emptyStream(stream);
            aggregateRoot = aggregateRoot || this.aggregateFactory(aggregateRootId);
            return aggregateRoot.fromHistory(stream);
        });
    }
    save(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = entity.getUncommittedEvents();
            yield this.append(entity.getAggregateRootId(), stream);
            this.takeSnapshot(entity);
            for (const message of stream.events) {
                yield this.eventBus.publish(message);
            }
        });
    }
    append(aggregateId, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dbal.append(aggregateId, stream);
        });
    }
    replayFrom(uuid, from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            const replayStream = yield this.dbal.loadFromTo(uuid, from, to);
            for (const message of replayStream.events) {
                yield this.eventBus.publish(message);
            }
        });
    }
    takeSnapshot(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.snapshotStore && this.isSnapshotNeeded(entity.version())) {
                yield this.snapshotStore.snapshot(entity);
            }
        });
    }
    isSnapshotNeeded(version) {
        return version !== 0 && version / this.snapshotMargin >= 1 && version % this.snapshotMargin === 0;
    }
    fromSnapshot(aggregateRootId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.snapshotStore) {
                return null;
            }
            const snapshot = yield this.snapshotStore.retrieve(aggregateRootId);
            if (!snapshot) {
                return null;
            }
            const aggregateRoot = this.aggregateFactory(aggregateRootId);
            aggregateRoot.fromSnapshot(snapshot);
            return aggregateRoot;
        });
    }
    aggregateFactory(aggregateRootId) {
        return new this.modelConstructor(aggregateRootId);
    }
    emptyStream(stream) {
        if (stream.isEmpty()) {
            throw new AggregateRootNotFoundException_1.default();
        }
    }
}
exports.default = EventStore;
//# sourceMappingURL=EventStore.js.map