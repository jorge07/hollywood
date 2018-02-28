"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @internal class
 */
class DomainMessage {
    constructor() {
        this.metadata = [];
    }
    static create(uuid, event) {
        const instance = new DomainMessage();
        instance.uuid = uuid;
        instance.event = event;
        instance.playhead = event.playhead;
        instance.ocurredOn = event.ocurrendOn;
        return instance;
    }
}
exports.DomainMessage = DomainMessage;
//# sourceMappingURL=DomainMessage.js.map