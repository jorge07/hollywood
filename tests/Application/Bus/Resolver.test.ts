import {HandlerResolver, Request} from "../../../src/Application/";
import {DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler} from "./DemoHandlers";

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", () => {
        const resolver = new HandlerResolver();

        const demoHandler = new DemoHandler();

        resolver
            .addHandler(DemoCommand, demoHandler)
            .addHandler(DemoQuery, new DemoQueryHandler());

        const caller = async (command: Request) => {
            return await resolver.resolve(command);
        };

        caller(new DemoQuery())
            .then((result) => expect(result).toBe("Hello!"));

        caller(new DemoCommand());

        expect(demoHandler.received).toBeTruthy();
    });
});
