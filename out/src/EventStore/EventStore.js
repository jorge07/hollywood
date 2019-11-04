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
    load(aggregateId) {
        return __awaiter(this, void 0, void 0, function* () {
            let aggregateRoot = null;
            aggregateRoot = yield this.fromSnapshot(aggregateId);
            const stream = yield this.dbal.load(aggregateId, aggregateRoot ? aggregateRoot.version() : 0);
            this.emptyStream(stream);
            aggregateRoot = aggregateRoot || this.aggregateFactory();
            return aggregateRoot.fromHistory(stream);
        });
    }
    save(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = entity.getUncommitedEvents();
            yield this.append(entity.getAggregateRootId(), stream);
            this.takeSnapshot(entity);
            stream.events.forEach((message) => this.eventBus.publish(message));
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
            replayStream.events.forEach((event) => this.eventBus.publish(event));
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
    fromSnapshot(aggregateId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.snapshotStore) {
                return null;
            }
            const snapshot = yield this.snapshotStore.retrieve(aggregateId);
            if (!snapshot) {
                return null;
            }
            const aggregateRoot = this.aggregateFactory();
            aggregateRoot.fromSnapshot(snapshot);
            return aggregateRoot;
        });
    }
    aggregateFactory() {
        return new this.modelConstructor();
    }
    emptyStream(stream) {
        if (stream.isEmpty()) {
            throw new AggregateRootNotFoundException_1.default();
        }
    }
}
exports.default = EventStore;
//# sourceMappingURL=EventStore.js.map