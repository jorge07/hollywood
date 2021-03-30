"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemorySnapshotStoreDBAL {
    constructor() {
        this.snapshots = {};
    }
    async get(uuid) {
        return this.snapshots[uuid];
    }
    async store(entity) {
        this.snapshots[entity.getAggregateRootId()] = Object.assign({}, entity);
    }
}
exports.default = InMemorySnapshotStoreDBAL;
//# sourceMappingURL=InMemorySnapshotStoreDBAL.js.map