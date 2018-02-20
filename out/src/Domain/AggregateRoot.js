"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DomainEventStream_1 = require("./Event/DomainEventStream");
const DomainMessage_1 = require("./Event/DomainMessage");
class AggregateRoot {
    constructor() {
        this._playhead = -1;
        this._events = [];
        this._methodPrefix = 'apply';
    }
    playhead() {
        return this._playhead;
    }
    raise(event) {
        this.applyEvent(event);
        this._events.push(event);
    }
    getUncommitedEvents() {
        const id = this.getAggregateRootId();
        const events = this._events.map((event) => (DomainMessage_1.DomainMessage.create(id, event)));
        this._events = [];
        return new DomainEventStream_1.DomainEventStream(events);
    }
    fromHistory(stream) {
        stream.events.forEach((message) => this.applyEvent(message.event));
        return this;
    }
    applyEvent(event) {
        this._playhead++;
        event.playhead = this._playhead;
        const method = this.methodToApplyEvent(event);
        if (this[method]) {
            this[method](event);
        }
    }
    methodToApplyEvent(event) {
        const name = AggregateRoot.eventName(event);
        return this._methodPrefix + name;
    }
    static eventName(event) {
        return event.constructor.name;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=AggregateRoot.js.map