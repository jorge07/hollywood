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
        this.eventType = event.domainEventName();
        this.ocurrendOn = new Date();
    }
    static create(uuid, playhead, event, metadata = []) {
        return new DomainMessage(uuid, playhead, event, metadata);
    }
}
exports.default = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map