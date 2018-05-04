"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class EventSourced extends _1.AggregateRoot {
    constructor() {
        super(...arguments);
        this.methodPrefix = "apply";
        this.aggregates = [];
        this.playhead = -1;
        this.events = [];
    }
    registerChild(child) {
        this.aggregates.push(child);
    }
    getUncommitedEvents() {
        const stream = new _1.DomainEventStream(this.events);
        this.events = [];
        return stream;
    }
    fromHistory(stream) {
        stream.events.forEach((message) => {
            this.playhead++;
            this.recursiveHandling(message.event, this.methodToApplyEvent(message.eventType));
        });
        return this;
    }
    version() {
        return this.playhead;
    }
    raise(event) {
        this.recursiveHandling(event, this.methodToApplyEvent(event.domainEventName()));
        this.playhead++;
        const domainMessage = _1.DomainMessage.create(this.getAggregateRootId(), this.playhead, event);
        this.events.push(domainMessage);
    }
    recursiveHandling(event, method) {
        this.handle(event, method);
        this.aggregates.forEach((aggregate) => {
            aggregate.recursiveHandling(event, method);
        });
    }
    handle(event, method) {
        if (this[method]) {
            this[method](event);
        }
    }
    methodToApplyEvent(eventName) {
        return this.methodPrefix + eventName;
    }
}
exports.default = EventSourced;
//# sourceMappingURL=EventSourced.js.map