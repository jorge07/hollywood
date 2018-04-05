"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const AggregateRoot_1 = require("./AggregateRoot");
class EventSourced extends AggregateRoot_1.default {
    constructor() {
        super(...arguments);
        this.methodPrefix = "apply";
        this.playhead = -1;
        this.events = [];
    }
    getUncommitedEvents() {
        const id = this.getAggregateRootId();
        const events = this.events.map((event) => (_1.DomainMessage.create(id, event)));
        this.events = [];
        return new _1.DomainEventStream(events);
    }
    fromHistory(stream) {
        stream.events.forEach((message) => {
            this.playhead++;
            this.applyDomainMessage(message);
        });
        return this;
    }
    version() {
        return this.playhead;
    }
    raise(event) {
        this.playhead++;
        this.applyEvent(event);
        this.events.push(event);
    }
    applyEvent(event) {
        event.playhead = this.playhead;
        this.applyDomainMessage(_1.DomainMessage.create(this.getAggregateRootId(), event));
    }
    applyDomainMessage(message) {
        const method = this.methodToApplyEvent(message);
        if (this[method]) {
            this[method](message.event);
        }
    }
    methodToApplyEvent(message) {
        return this.methodPrefix + message.eventType;
    }
}
exports.default = EventSourced;
//# sourceMappingURL=EventSourced.js.map