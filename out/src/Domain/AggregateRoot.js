"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
class AggregateRoot {
    constructor() {
        this.methodPrefix = "apply";
        this.playhead = -1;
        this.events = [];
    }
    raise(event) {
        this.applyEvent(event);
        this.events.push(event);
    }
    getUncommitedEvents() {
        const id = this.getAggregateRootId();
        const events = this.events.map((event) => (_1.DomainMessage.create(id, event)));
        this.events = [];
        return new _1.DomainEventStream(events);
    }
    fromHistory(stream) {
        stream.events.forEach((message) => this.applyEvent(message.event));
        return this;
    }
    applyEvent(event) {
        this.playhead++;
        event.playhead = this.playhead;
        const method = this.methodToApplyEvent(event);
        if (this[method]) {
            this[method](event);
        }
    }
    methodToApplyEvent(event) {
        const name = this.eventName(event);
        return this.methodPrefix + name;
    }
    eventName(event) {
        return event.constructor.name;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=AggregateRoot.js.map