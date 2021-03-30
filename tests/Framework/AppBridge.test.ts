import 'reflect-metadata';
import Kernel from '../../src/Framework/Kernel';
import {
    DemoQuery,
    DemoQueryHandler,
    DemoCommand,
    DemoHandler,
    MissingAnnotationDemoQueryHandler
} from '../Application/Bus/DemoHandlers';
import type {QueryBusResponse} from '../../src/Application/Bus/CallbackArg';
import ModuleContext from "../../src/Framework/Modules/ModuleContext";
import MissingAutowiringAnnotationException
    from "../../src/Application/Bus/Exception/MissingAutowiringAnnotationException";
import {SERVICES_ALIAS} from "../../src/Framework";
import {ServiceList} from "../../src/Framework/Container/Items/Service";

const services: ServiceList = new Map([
    [SERVICES_ALIAS.QUERY_HANDLERS, {instance: DemoQueryHandler}],
    [SERVICES_ALIAS.COMMAND_HANDLERS, {instance: DemoHandler}],
]);

const DemoModules = new ModuleContext({services});

const servicesTestAnnotations: ServiceList = new Map([
    [SERVICES_ALIAS.QUERY_HANDLERS, {instance: MissingAnnotationDemoQueryHandler}],
]);

const DemoModulesTestAnnotations = new ModuleContext({services: servicesTestAnnotations});

describe("Framework:AppBridge", () => {
    it("Should be able to compose and perform a query", async () => {
        expect.assertions(1);

        const kernel = await Kernel.createFromModuleContext(
            'test',
            new Map(),
            DemoModules
        );

        const response: QueryBusResponse = await kernel.app.ask(new DemoQuery(false));
        expect({"data": "Hello!"}).toEqual(response);
    });
    it("Should be able to compose and perform a command", async () => {
        expect.assertions(1);

        const kernel = await Kernel.createFromModuleContext(
            'test',
            new Map(),
            DemoModules
        );

        try {
            await kernel.app.handle(new DemoCommand(true));
        } catch (err) {
            expect(err).toEqual({"code": 1, "message": "Fail"});
        }
    });
    it("Missing @autowiring annotation should throw an error", async () => {
        expect.assertions(1);

        try {
            await Kernel.createFromModuleContext(
                'test',
                new Map(),
                DemoModulesTestAnnotations
            );
        } catch (err) {
            expect(err).toBeInstanceOf(MissingAutowiringAnnotationException);
        }
    });
});
