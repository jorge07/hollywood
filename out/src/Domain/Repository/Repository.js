"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Repository {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    async save(aggregateRoot) {
        await this.eventStore.save(aggregateRoot);
    }
    async load(aggregateRootId) {
        return this.eventStore.load(aggregateRootId);
    }
}
exports.default = Repository;
//# sourceMappingURL=Repository.js.map