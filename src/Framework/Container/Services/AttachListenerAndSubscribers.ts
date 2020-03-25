import { Container, decorate, injectable } from 'inversify';
import DomainEvent from "../../../Domain/Event/DomainEvent";
import EventBus from "../../../EventStore/EventBus/EventBus";
import { IService, ServiceList } from "../Items/Service";
import EventListener from '../../../EventStore/EventBus/EventListener';
import EventSubscriber from '../../../EventStore/EventBus/EventSubscriber';

decorate(injectable(), EventListener);
decorate(injectable(), EventSubscriber);

export default function attachListenersAndSubscribers(serviceList: ServiceList, container: Container): void {
    for (const serviceDefinitionItem of serviceList) {
        if (serviceDefinitionItem[1].listener || serviceDefinitionItem[1].subscriber) {
            listenerBinder(container, serviceDefinitionItem[1], serviceDefinitionItem[0]);
        }
    }
}

function listenerBinder(
    container: Container,
    serviceDefinition: IService,
    key: string,
) {
    if (!serviceDefinition.bus) {
        throw new Error(`Missing bus parameter in Service tags for: ${key}`);
    }

    if (serviceDefinition.listener) {
        container.get<EventBus>(serviceDefinition.bus).addListener(container.get(key));
        return;
    }

    if (serviceDefinition.subscriber) {
        for (const index in serviceDefinition.subscriber) {
            if (serviceDefinition.subscriber.hasOwnProperty(index)) {
                const event: DomainEvent = serviceDefinition.subscriber[index];
                container.get<EventBus>(serviceDefinition.bus).attach(
                    event,
                    container.get(key),
                );
            }
        }
    }
}
