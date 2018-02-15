"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal class
 */
class DomainMessage {
    constructor(uuid, event, metadata = []) {
        this.uuid = uuid;
        this.event = event;
        this.metadata = metadata;
        this.playhead = event.playhead;
        this.ocurredOn = event.ocurrendOn;
    }
    static create(uuid, event) {
        return new DomainMessage(uuid, event);
    }
}
exports.DomainMessage = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map