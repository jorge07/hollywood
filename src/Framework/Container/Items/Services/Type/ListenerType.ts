import { decorate, injectable } from 'inversify';
import type {interfaces} from "inversify";
import type { IService } from "../../Service";
import type EventBus from "../../../../../EventSourcing/EventBus/EventBus";
import EventListener from "../../../../../EventSourcing/EventBus/EventListener";
import EventSubscriber from "../../../../../EventSourcing/EventBus/EventSubscriber";


decorate(injectable(), EventListener);
decorate(injectable(), EventSubscriber);

const LISTENERS_SELECTOR = 'hollywood.listeners';

export function IsListenerType(serviceDefinition: IService): boolean {
    return !!(serviceDefinition.listener || serviceDefinition.subscriber)
}

export default function ListenerType(bind: interfaces.Bind) {
    return (key: string, serviceDefinition: IService) => {
        bind(key).to(serviceDefinition.instance).inSingletonScope();
        bind(LISTENERS_SELECTOR).toDynamicValue(listenerBinder(serviceDefinition, key));
    }
}
export function BindListeners(container: interfaces.Container) {
    if (container.isBound(LISTENERS_SELECTOR)) {
        container.get(LISTENERS_SELECTOR);
    }
}

function listenerBinder(serviceDefinition: IService, key: string) {
    return ({container}: interfaces.Context) => {
        if (!serviceDefinition.bus) {
            throw new Error(`Missing bus parameter in ServiceDefinition for: ${key}`);
        }

        if (!container.isBound(serviceDefinition.bus)) {
            throw new Error(`Bus doesn't exists for ${key}. Bus name: ${serviceDefinition.bus}`);
        }

        if (serviceDefinition.listener) {
            container.get<EventBus>(serviceDefinition.bus).addListener(container.get(key));
            return;
        }

        if (Array.isArray(serviceDefinition.subscriber) && serviceDefinition.subscriber.length > 0) {
            for (const event of serviceDefinition.subscriber) {
                container.get<EventBus>(serviceDefinition.bus).attach(event, container.get(key));
            }
        }
    }
}
