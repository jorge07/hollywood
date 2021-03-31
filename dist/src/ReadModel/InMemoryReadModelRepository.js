"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InMemoryReadModelRepository {
    constructor() {
        this.collection = {};
    }
    save(id, data) {
        this.collection[id] = data;
    }
    oneOrFail(id) {
        const data = this.collection[id];
        if (!data) {
            throw new Error("Not Found");
        }
        return data;
    }
    find(criteria) {
        return criteria(this.collection);
    }
}
exports.default = InMemoryReadModelRepository;
//# sourceMappingURL=InMemoryReadModelRepository.js.map