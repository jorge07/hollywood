"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class DomainMessage {
    constructor(uuid, event, metadata) {
        this.uuid = uuid;
        this.event = event;
        this.metadata = metadata;
        this.eventType = event.constructor.name;
    }
    static create(uuid, event, metadata = []) {
        return new DomainMessage(uuid, event, metadata);
    }
}
exports.default = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map