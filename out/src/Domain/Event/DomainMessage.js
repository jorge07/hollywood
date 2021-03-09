"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class DomainMessage {
    constructor(uuid, playhead, event, metadata) {
        this.uuid = uuid;
        this.playhead = playhead;
        this.event = event;
        this.metadata = metadata;
        this.eventType = DomainMessage.extractEventType(event);
        this.occurred = new Date();
    }
    static create(uuid, playhead, event, metadata = []) {
        return new DomainMessage(uuid, playhead, event, metadata);
    }
    static extractEventType(event) {
        return event.constructor.name;
    }
}
exports.default = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map