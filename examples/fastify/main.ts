import { HTTP } from "./http";
import { Framework, ReadModel } from "hollywood-js";
import {CreateUser, CreateUserHandler, FindUserHandler} from "./app";

const MainModule =  new Framework.ModuleContext({
    services: new Map([
        [ 'user.repository', { instance: ReadModel.InMemoryReadModelRepository } ]
    ]),
    commands: [
        CreateUserHandler
    ],
    queries: [
        FindUserHandler
    ]
})
const kernel = await Framework.Kernel.createFromModuleContext('dev', new Map(), MainModule);
await kernel.app.handle(new CreateUser('uuid-fake', 'fake'));
const api =  new HTTP(kernel);
await api.up();
