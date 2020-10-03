"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const inversify_1 = require("inversify");
const App_1 = __importDefault(require("../Application/App"));
const Alias_1 = require("./Container/Bridge/Alias");
const MissingAutowiringAnnotationException_1 = __importDefault(require("../Application/Bus/Exception/MissingAutowiringAnnotationException"));
let AppBridge = class AppBridge {
    constructor(commandHandlers, queryHandlers, commandMiddleware = [], queryMiddleware = []) {
        const commands = new Map();
        const queries = new Map();
        const commandName = (target) => {
            if (!target.command) {
                throw new MissingAutowiringAnnotationException_1.default(target);
            }
            return target.command;
        };
        if (!Array.isArray(commandHandlers[0])) {
            commandHandlers.forEach((handler) => {
                commands.set(commandName(handler), handler);
            });
        }
        if (!Array.isArray(queryHandlers[0])) {
            queryHandlers.forEach((handler) => {
                queries.set(commandName(handler), handler);
            });
        }
        this.app = new App_1.default(commands, queries);
    }
    ask(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.app.ask(query);
        });
    }
    handle(command) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.app.handle(command);
        });
    }
};
AppBridge = __decorate([
    __param(0, inversify_1.multiInject(Alias_1.SERVICES_ALIAS.COMMAND_HANDLERS)),
    __param(1, inversify_1.multiInject(Alias_1.SERVICES_ALIAS.QUERY_HANDLERS)),
    __param(2, inversify_1.multiInject(Alias_1.SERVICES_ALIAS.COMMAND_MIDDLEWARE)),
    __param(3, inversify_1.multiInject(Alias_1.SERVICES_ALIAS.QUERY_MIDDLEWARE)),
    __metadata("design:paramtypes", [Array, Array, Array, Array])
], AppBridge);
exports.default = AppBridge;
//# sourceMappingURL=AppBridge.js.map