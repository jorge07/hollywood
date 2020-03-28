"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const EventListener_1 = __importDefault(require("../../../EventStore/EventBus/EventListener"));
const EventSubscriber_1 = __importDefault(require("../../../EventStore/EventBus/EventSubscriber"));
inversify_1.decorate(inversify_1.injectable(), EventListener_1.default);
inversify_1.decorate(inversify_1.injectable(), EventSubscriber_1.default);
function attachListenersAndSubscribers(serviceList, container) {
    for (const serviceDefinitionItem of serviceList) {
        if (serviceDefinitionItem[1].listener || serviceDefinitionItem[1].subscriber) {
            listenerBinder(container, serviceDefinitionItem[1], serviceDefinitionItem[0]);
        }
    }
}
exports.default = attachListenersAndSubscribers;
function listenerBinder(container, serviceDefinition, key) {
    if (!serviceDefinition.bus) {
        throw new Error(`Missing bus parameter in Service tags for: ${key}`);
    }
    if (serviceDefinition.listener) {
        container.get(serviceDefinition.bus).addListener(container.get(key));
        return;
    }
    if (serviceDefinition.subscriber) {
        for (const index in serviceDefinition.subscriber) {
            if (serviceDefinition.subscriber.hasOwnProperty(index)) {
                const event = serviceDefinition.subscriber[index];
                container.get(serviceDefinition.bus).attach(event, container.get(key));
            }
        }
    }
}
//# sourceMappingURL=AttachListenerAndSubscribers.js.map