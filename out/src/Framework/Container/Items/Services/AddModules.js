"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.createContainerModule = void 0;
const inversify_1 = require("inversify");
const StandardType_1 = __importDefault(require("./Type/StandardType"));
const CollectionType_1 = __importStar(require("./Type/CollectionType"));
const AsyncType_1 = __importStar(require("./Type/AsyncType"));
const CustomType_1 = __importStar(require("./Type/CustomType"));
const EventStoreType_1 = __importStar(require("./Type/EventStoreType"));
const ListenerType_1 = __importStar(require("./Type/ListenerType"));
function createContainerModule(serviceList) {
    return new inversify_1.AsyncContainerModule((bind, unbind, isBound, rebind) => __awaiter(this, void 0, void 0, function* () {
        for (const [key, serviceDefinition] of serviceList) {
            decorateService(serviceDefinition);
            switch (true) {
                case CollectionType_1.IsCollectionType(serviceDefinition):
                    CollectionType_1.default(bind, unbind, isBound)(key, serviceDefinition);
                    break;
                case AsyncType_1.IsAsyncType(serviceDefinition):
                    yield AsyncType_1.default(rebind, isBound, bind)(key, serviceDefinition);
                    break;
                case CustomType_1.IsCustomType(serviceDefinition):
                    CustomType_1.default(rebind, isBound, bind)(key, serviceDefinition);
                    break;
                case EventStoreType_1.IsEventStoreType(serviceDefinition):
                    EventStoreType_1.default(rebind, isBound, bind)(key, serviceDefinition);
                    break;
                case ListenerType_1.IsListenerType(serviceDefinition):
                    ListenerType_1.default(bind, rebind, isBound)(key, serviceDefinition);
                    break;
                default:
                    StandardType_1.default(rebind, isBound, bind)(key, serviceDefinition);
            }
        }
    }));
}
exports.createContainerModule = createContainerModule;
function decorateService(serviceDefinition) {
    if (serviceDefinition.instance
        && !Array.isArray(serviceDefinition.instance) // Can't decorate array wrap for collections
        && serviceDefinition.instance.name !== "" // Not decorate anon
        && !Reflect.hasOwnMetadata(inversify_1.METADATA_KEY.PARAM_TYPES, serviceDefinition.instance) // Don't redecorate
    ) {
        inversify_1.decorate(inversify_1.injectable(), serviceDefinition.instance);
    }
}
//# sourceMappingURL=AddModules.js.map