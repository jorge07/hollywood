"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("./user");
const Resolver_1 = require("../src/Application/Bus/Resolver");
const Bus_1 = require("../src/Application/Bus/Bus");
class UserSayHello {
}
class UserSayHelloHandler {
    handle(c) {
        setTimeout(() => {
            console.log((new user_1.User).create('p@p.cpm').sayHello());
        }, 250);
    }
}
class QueryDemo {
}
class DemoQueryHandler {
    handle(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('WEBA');
                }, 1000);
            });
        });
    }
}
// Provision
let resolver = new Resolver_1.HandlerResolver();
resolver.addHandler(new UserSayHello, new UserSayHelloHandler());
resolver.addHandler(new QueryDemo, new DemoQueryHandler());
let bus = new Bus_1.Bus(resolver);
console.log('Command Start');
bus.handle(new UserSayHello);
console.log('CommandCalled');
console.log('Query Start');
bus.handle(new QueryDemo)
    .then((res) => console.log(res))
    .catch(err => (console.log(err)));
console.log('Query Called');
setTimeout(() => console.log('DONE'), 2000);
//# sourceMappingURL=CommandAndQueryHandlers.js.map