import {Framework} from "hollywood-js";
import {InMemoryRepository} from "./read-model/in-memory-repository";
import {SharedModule} from "../../shared/infrastructure/shared-module";
import CreateHandler from "../application/command/create/handler";

export const CustomerModule = new Framework.ModuleContext({
    commands: [
        CreateHandler
    ],
    services: {
        "customer.repository": { instance: InMemoryRepository }
    },
    modules: [
        SharedModule
    ]
});
