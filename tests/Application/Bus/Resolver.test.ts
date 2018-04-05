import { AppError, AppResponse, CommandBus, CommandHandlerResolver, ICommand, IQuery, QueryBus, QueryHandlerResolver } from "../../../src/Application/";
import { DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler } from "./DemoHandlers";

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", async () => {
        expect.assertions(5);

        const queryResolver = new QueryHandlerResolver();
        const resolver = new CommandHandlerResolver();
        const demoHandler = new DemoHandler();
        const commandBus = new CommandBus(resolver);
        const queryBus = new QueryBus(queryResolver);

        resolver
            .addHandler(DemoCommand, demoHandler);
        queryResolver
            .addHandler(DemoQuery, new DemoQueryHandler());

        const response: any = await queryBus.ask(new DemoQuery());
        expect(response.data).toBe("Hello!");

        try {
            await queryBus.ask(new DemoQuery(true));
            expect("Exception").toBe("Not throwed");
        } catch (err) {
            expect(err.code).toBe(0);
        }

        const res: any = await commandBus.handle(new DemoCommand(false));
        expect(demoHandler.received).toBeTruthy();

        try {
            await queryBus.ask(new DemoQuery(true));
            expect("Exception Query").toBe("Not throwed");
        } catch (err) {
            expect(err.code).toBe(0);
        }

        try {
            const resp = await commandBus.handle(new DemoCommand(true));
            expect("Exception Command").toBe("Not throwed");
        } catch (err) {
            expect(err.message).toBe("Fail");
        }
    });
});
