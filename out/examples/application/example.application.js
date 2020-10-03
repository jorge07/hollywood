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
exports.handler = void 0;
// ts-node examples/application/example.application.ts
require("reflect-metadata");
const EventStore_1 = require("../../src/EventStore");
const User_1 = __importDefault(require("../domain/User"));
const InMemorySnapshotStoreDBAL_1 = __importDefault(require("../../src/EventStore/Snapshot/InMemorySnapshotStoreDBAL"));
const CreateUserHandler_1 = __importDefault(require("./CreateUserHandler"));
const CreateUser_1 = __importDefault(require("./CreateUser"));
const eventStore = new EventStore_1.EventStore(User_1.default, new EventStore_1.InMemoryEventStore(), new EventStore_1.EventBus(), new InMemorySnapshotStoreDBAL_1.default(), 10);
exports.handler = new CreateUserHandler_1.default(eventStore);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.handler.handle(new CreateUser_1.default("1", "demo@example.org"));
    console.log(yield eventStore.load("1"));
}))();
//# sourceMappingURL=example.application.js.map