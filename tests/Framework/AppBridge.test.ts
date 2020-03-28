import 'reflect-metadata';
import { inject } from 'inversify';
import Kernel from '../../src/Framework/Kernel';
import { ParametersList, UniqueParameterIdentifier, Parameter } from '../../src/Framework/Container/Items/Parameter';
import { ServiceList } from '../../src/Framework/Container/Items/Service';
import { ICommand, ICommandHandler } from '../../src/Application';
import { DemoQuery, DemoQueryHandler, DemoCommand, DemoHandler } from '../Application/Bus/DemoHandlers';
import App from '../../src/Application/App';
import { SERVICES_ALIAS } from '../../src/Framework/Container/Bridge/Alias';
import { QueryBusResponse } from '../../src/Application/Bus/CallbackArg';

const services: ServiceList = new Map([
    [SERVICES_ALIAS.QUERY_HANDLERS, {instance: DemoQueryHandler}],
    [SERVICES_ALIAS.COMMAND_HANDLERS, {instance: DemoHandler}],
]);

describe("AppBridge", () => { 
    it("Should be able to compose and performa a query", async () => {
        expect.assertions(1);

        const kernel = await Kernel.create(
            'test', 
            true, 
            services, 
            new Map()
        );

        const response: QueryBusResponse = await kernel.ask(new DemoQuery(false));
        expect({"data": "Hello!"}).toEqual(response);
    });
    it("Should be able to compose and performa a command", async () => {
        expect.assertions(1);

        const kernel = await Kernel.create(
            'test', 
            true, 
            services, 
            new Map()
        );

        try {
            await kernel.handle(new DemoCommand(true));
        } catch (err) {
            expect(err).toEqual({"code": 1, "message": "Fail"});
        }
    });
});
