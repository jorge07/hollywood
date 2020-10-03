"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const EventStore_1 = __importDefault(require("../../../EventStore/EventStore"));
const Alias_1 = require("../Bridge/Alias");
function addModules(serviceList, modules) {
    for (const serviceDefinitionItem of serviceList) {
        modules.push(module(serviceDefinitionItem[1], serviceDefinitionItem[0]));
    }
}
exports.default = addModules;
function module(serviceDefinition, key) {
    return new inversify_1.AsyncContainerModule((bind, unbind, isBound, rebind) => __awaiter(this, void 0, void 0, function* () {
        decorateService(serviceDefinition);
        switch (true) {
            case Boolean(serviceDefinition.collection):
                processCollection(serviceDefinition.collection, key, bind);
                break;
            case Boolean(serviceDefinition.async):
                yield processAsync(serviceDefinition.async, key, bind);
                break;
            case Boolean(serviceDefinition.custom):
                processCustom(serviceDefinition.custom, key, bind);
                break;
            case Boolean(serviceDefinition.eventStore):
                eventStoreFactory(serviceDefinition.eventStore, key, bind);
                break;
            default:
                bind(key).to(serviceDefinition.instance).inSingletonScope();
        }
    }));
}
function decorateService(serviceDefinition) {
    if (serviceDefinition.instance
        && !Array.isArray(serviceDefinition.instance) // Can't decorate array wrap for collections
        && serviceDefinition.instance.name !== "" // Not decorate anon
        && !Reflect.hasOwnMetadata(inversify_1.METADATA_KEY.PARAM_TYPES, serviceDefinition.instance) // Don't redecorate
    ) {
        inversify_1.decorate(inversify_1.injectable(), serviceDefinition.instance);
    }
}
function processCollection(collection, key, bind) {
    if (collection.length === 0) {
        // Empty aray as marker of no content
        bind(key).toDynamicValue(() => []).inSingletonScope();
        return;
    }
    collection.forEach((item) => {
        bind(key).to(item).inSingletonScope();
    });
}
function processAsync(asyncFunc, key, bind) {
    return __awaiter(this, void 0, void 0, function* () {
        const service = yield asyncFunc();
        bind(key).toConstantValue(service);
    });
}
function processCustom(custom, key, bind) {
    bind(key).toDynamicValue(custom).inSingletonScope();
}
function eventStoreFactory(eventSourcedEntity, key, bind) {
    bind(key).toDynamicValue(({ container }) => {
        return new EventStore_1.default(eventSourcedEntity, container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_DBAL), container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_BUS), container.get(Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_STORE_SNAPSHOT_DBAL), container.get(Alias_1.PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN));
    }).inSingletonScope();
}
//# sourceMappingURL=AddModules.js.map