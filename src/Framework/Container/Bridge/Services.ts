import { ServiceList } from '../Items/Service';
import EventBus from '../../../EventStore/EventBus/EventBus';
import InMemoryEventStore from '../../../EventStore/InMemoryEventStore';
import { interfaces } from 'inversify';
import AppBridge from '../../AppBridge';
import { SERVICES_ALIAS } from './Alias';

export const LIST: ServiceList = new Map([
    // Application Layer
    [SERVICES_ALIAS.COMMAND_HANDLERS, { collection: [] }],
    [SERVICES_ALIAS.QUERY_HANDLERS, { collection: [] }],
    [SERVICES_ALIAS.COMMAND_MIDDLEWARE, { collection: [] }],
    [SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    // Infrastructure layer
    [SERVICES_ALIAS.QUERY_MIDDLEWARE, { collection: [] }],
    [SERVICES_ALIAS.DEFAULT_EVENT_BUS, { instance: EventBus }],
    [SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL, { instance: InMemoryEventStore }],
    [SERVICES_ALIAS.APP_BRIDGE, { instance: AppBridge }],
]);
