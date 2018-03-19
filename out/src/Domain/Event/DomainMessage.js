"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal
 */
class DomainMessage {
    constructor(uuid, event, playhead, ocurredOn, metadata = []) {
        this.uuid = uuid;
        this.event = event;
        this.playhead = playhead;
        this.ocurredOn = ocurredOn;
        this.metadata = metadata;
    }
    static create(uuid, event) {
        return new DomainMessage(uuid, event, event.playhead, event.ocurrendOn);
    }
}
exports.default = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map