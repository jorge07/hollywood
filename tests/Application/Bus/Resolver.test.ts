import {DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler} from "./DemoHandlers";
import QueryHandlerResolver from "../../../src/Application/Bus/Query/QueryResolver";
import CommandHandlerResolver from "../../../src/Application/Bus/Command/CommandHandlerResolver";
import QueryBus from "../../../src/Application/Bus/Query/QueryBus";
import CommandBus from "../../../src/Application/Bus/Command/CommandBus";

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", async () => {
        expect.assertions(6);

        const queryResolver = new QueryHandlerResolver();
        const resolver = new CommandHandlerResolver();
        const demoHandler = new DemoHandler();
        const commandBus = new CommandBus(resolver);
        const queryBus = new QueryBus(queryResolver);

        resolver.addHandler(DemoCommand, demoHandler);
        queryResolver.addHandler(DemoQuery, new DemoQueryHandler());

        const response: any = await queryBus.ask(new DemoQuery());
        expect(response.data).toBe("Hello!");

        try {
            await queryBus.ask(new DemoQuery(true));
            expect("Query bus Exception").toBe("Not threw");
        } catch (err) {
            expect(err.code).toBe(0);
        }

        await commandBus.handle(new DemoCommand(false));
        expect(demoHandler.received).toBeTruthy();

        try {
            await queryBus.ask(new DemoQuery(true));
            expect("Exception Query").toBe("Not threw");
        } catch (err) {
            expect(err.code).toBe(0);
        }

        try {
            await commandBus.handle(new DemoCommand(true));
            expect("Exception Command").toBe("Not threw");
        } catch (err) {
            expect(err.message).toBe("Fail");
        }

        try {
            await commandBus.handle(new DemoCommand(true));
            expect("Exception Command").toBe("Not threw");
        } catch (err) {
            expect(err.message).toBe("Fail");
        }
    });

    it("No handler do nothing", async () => {
        expect.assertions(2);

        const commandBus = new CommandBus(new CommandHandlerResolver());
        const queryBus = new QueryBus(new QueryHandlerResolver());

        const response: any = await queryBus.ask(new DemoQuery());
        expect(response).toBe(null);

        const res: any = await commandBus.handle(new DemoCommand(false));
        expect(res).toBe(undefined);
    });
});
