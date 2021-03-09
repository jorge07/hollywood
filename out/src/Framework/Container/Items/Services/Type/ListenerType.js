"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindListeners = exports.IsListenerType = void 0;
const inversify_1 = require("inversify");
const EventListener_1 = __importDefault(require("../../../../../EventSourcing/EventBus/EventListener"));
const EventSubscriber_1 = __importDefault(require("../../../../../EventSourcing/EventBus/EventSubscriber"));
inversify_1.decorate(inversify_1.injectable(), EventListener_1.default);
inversify_1.decorate(inversify_1.injectable(), EventSubscriber_1.default);
const LISTENERS_SELECTOR = 'hollywood.listeners';
function IsListenerType(serviceDefinition) {
    return !!(serviceDefinition.listener || serviceDefinition.subscriber);
}
exports.IsListenerType = IsListenerType;
function ListenerType(bind) {
    return (key, serviceDefinition) => {
        bind(key).to(serviceDefinition.instance).inSingletonScope();
        bind(LISTENERS_SELECTOR).toDynamicValue(listenerBinder(serviceDefinition, key));
    };
}
exports.default = ListenerType;
function BindListeners(container) {
    if (container.isBound(LISTENERS_SELECTOR)) {
        container.getAll(LISTENERS_SELECTOR);
    }
}
exports.BindListeners = BindListeners;
function listenerBinder(serviceDefinition, key) {
    return ({ container }) => {
        if (!serviceDefinition.bus) {
            throw new Error(`Missing bus parameter in ServiceDefinition for: ${key}`);
        }
        if (!container.isBound(serviceDefinition.bus)) {
            throw new Error(`Bus doesn't exists for ${key}. Bus name: ${serviceDefinition.bus}`);
        }
        if (serviceDefinition.listener) {
            container.get(serviceDefinition.bus).addListener(container.get(key));
            return;
        }
        if (Array.isArray(serviceDefinition.subscriber) && serviceDefinition.subscriber.length > 0) {
            for (const event of serviceDefinition.subscriber) {
                container.get(serviceDefinition.bus).attach(event, container.get(key));
            }
        }
    };
}
//# sourceMappingURL=ListenerType.js.map