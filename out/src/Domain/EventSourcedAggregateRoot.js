"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class EventSourcedAggregateRoot extends _1.AggregateRoot {
    constructor() {
        super(...arguments);
        this.methodPrefix = "apply";
        this.playhead = -1;
        this.events = [];
        this.children = [];
    }
    getUncommittedEvents() {
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
    fromSnapshot(snapshot) {
        Object.assign(this, snapshot);
        return this;
    }
    recursiveHandling(event, method) {
        this.handle(event, method);
        this.getChildEntities().forEach((aggregate) => {
            aggregate.recursiveHandling(event, method);
        });
    }
    version() {
        return this.playhead;
    }
    getChildEntities() {
        return this.children;
    }
    registerChildren(child) {
        this.children.push(child);
    }
    raise(event) {
        const domainMessage = _1.DomainMessage.create(this.getAggregateRootId(), this.playhead, event);
        this.recursiveHandling(event, this.methodToApplyEvent(domainMessage.eventType));
        this.playhead++;
        this.events.push(domainMessage);
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
exports.default = EventSourcedAggregateRoot;
//# sourceMappingURL=EventSourcedAggregateRoot.js.map