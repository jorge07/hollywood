import {Framework} from "hollywood-js";
import {InMemoryRepository} from "./read-model/in-memory-repository";
import {SharedModule} from "../../shared/infrastructure/shared-module";
import CreateHandler from "../application/command/create/handler";

const services = (new Map())
    .set("customer.repository", { instance: InMemoryRepository })
;
export const CustomerModule = new Framework.ModuleContext({
    commands: [
        CreateHandler
    ],
    services,
    modules: [
        SharedModule
    ]
});
