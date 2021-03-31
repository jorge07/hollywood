"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DomainMessage_1 = __importDefault(require("./Event/DomainMessage"));
const DomainEventStream_1 = __importDefault(require("./Event/DomainEventStream"));
const AggregateRoot_1 = __importDefault(require("./AggregateRoot"));
class EventSourcedAggregateRoot extends AggregateRoot_1.default {
    constructor() {
        super(...arguments);
        this.methodPrefix = "apply";
        this.playhead = -1;
        this.events = [];
        this.children = [];
    }
    getUncommittedEvents() {
        const stream = new DomainEventStream_1.default(this.events);
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
        const children = snapshot.children;
        delete snapshot.children;
        Object.assign(this, snapshot);
        this.children.forEach((child, key) => child.fromSnapshot(children[key]));
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
        const domainMessage = DomainMessage_1.default.create(this.getAggregateRootId(), this.playhead, event);
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