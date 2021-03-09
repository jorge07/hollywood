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
// ts-node examples/framework/Framework.ts
require("reflect-metadata");
const Alias_1 = require("../../src/Framework/Container/Bridge/Alias");
const CreateUserHandler_1 = __importDefault(require("../application/CreateUserHandler"));
const User_1 = __importDefault(require("../domain/User"));
const Kernel_1 = __importDefault(require("../../src/Framework/Kernel"));
const CreateUser_1 = __importDefault(require("../application/CreateUser"));
const ModuleContext_1 = __importDefault(require("../../src/Framework/Modules/ModuleContext"));
const EventListener_1 = __importDefault(require("../../src/EventStore/EventBus/EventListener"));
class EchoListener extends EventListener_1.default {
    constructor() {
        super(...arguments);
        this.counter = 0;
    }
    on(message) {
        this.counter++;
        console.log(`The following event with id ${message.uuid} was Stored in Memory`, message.event); // Confirm that event was received
    }
}
const parameters = new Map([
    [Alias_1.PARAMETERS_ALIAS.DEFAULT_EVENT_STORE_MARGIN, "40"] // You can overwrite default parameters
]);
const services = new Map([
    [Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS, {
            collection: [
                CreateUserHandler_1.default
            ]
        }],
    ["user.eventStore", {
            eventStore: User_1.default
        }],
    ["generic.subscriber", {
            instance: EchoListener,
            bus: Alias_1.SERVICES_ALIAS.DEFAULT_EVENT_BUS,
            listener: true
        }],
]);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const appModule = new ModuleContext_1.default({ services });
    const kernel = yield Kernel_1.default.createFromModuleContext("dev", true, parameters, appModule);
    yield kernel.handle(new CreateUser_1.default("1", "demo@example.org"));
    const recreatedUser = yield kernel.container.get("user.eventStore").load("1"); // Recreate User from events
    const listener = yield kernel.container.get("generic.subscriber");
    console.log('Listeners', listener.counter);
    console.log(recreatedUser); // Display the created user
    console.log(kernel.container.get("user.eventStore") // Conform overwrited default parameters (snapshotMargin 10 -> 40)
    );
}))();
//# sourceMappingURL=Framework.js.map