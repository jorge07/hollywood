import {HandlerResolver} from "../../../src/Application/Bus/Resolver";
import {DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler} from "./DemoHandlers";
import {Request} from "../../../src/Application/Bus/Request";

describe('HandlerResolver test suite', () => {
    it('It should routing to correct handler', () => {
        const resolver = new HandlerResolver();

        let demoHandler = new DemoHandler();

        resolver
            .addHandler(new DemoCommand(), demoHandler)
            .addHandler(new DemoQuery(), new DemoQueryHandler());

        const caller = async (command: Request) => {
            return await resolver.resolve(command)
        };

        caller(new DemoQuery())
            .then(result => expect(result).toBe('Hello!'));

        caller(new DemoCommand());

        expect(demoHandler.received).toBeTruthy()
    })
});