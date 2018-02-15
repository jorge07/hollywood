import {User} from "./user";
import {Command} from "../src/Application/Bus/Command/Command";
import {CommandHandler} from "../src/Application/Bus/Command/CommandHandler";
import {QueryHandler} from "../src/Application/Bus/Query/QueryHandler";
import {Query} from "../src/Application/Bus/Query/Query";
import {HandlerResolver} from "../src/Application/Bus/Resolver";
import {Bus} from "../src/Application/Bus/Bus";

class UserSayHello implements Command {

}

class UserSayHelloHandler implements CommandHandler {
    handle(c: UserSayHello): void {
        setTimeout(() => {

            console.log(
                (new User).create('p@p.cpm').sayHello()
            );
        }, 250);
    }
}

class QueryDemo implements Query {}

class DemoQueryHandler implements QueryHandler {

    async handle(query: QueryDemo): Promise<any> {
        return new Promise((resolve) => {
            setTimeout(()=> {
                resolve('WEBA')
            }, 1000)
        })
    }
}

// Provision
let resolver = new HandlerResolver();
resolver.addHandler(new UserSayHello, new UserSayHelloHandler());
resolver.addHandler(new QueryDemo, new DemoQueryHandler());
let bus = new Bus(resolver);



console.log('Command Start');
bus.handle(new UserSayHello);
console.log('CommandCalled');

console.log('Query Start');
bus.handle(new QueryDemo)
    .then((res) => console.log(res))
    .catch(err => (console.log(err)))
;
console.log('Query Called');
setTimeout(() => console.log('DONE'), 2000);

