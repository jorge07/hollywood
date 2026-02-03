import {DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler} from "./DemoHandlers";
import IMiddleware from '../../../src/Application/Bus/Middleware';
import QueryHandlerResolver from "../../../src/Application/Bus/Query/QueryResolver";
import CommandHandlerResolver from "../../../src/Application/Bus/Command/CommandHandlerResolver";
import CommandBus from "../../../src/Application/Bus/Command/CommandBus";
import QueryBus from "../../../src/Application/Bus/Query/QueryBus";

class CustomMiddleware implements IMiddleware {
    calls: number = 0

    async execute(command: any, next: (command: any) => any): Promise<any> {
        this.calls++;
        return await next(command);
    }
}

// tslint:disable-next-line:max-classes-per-file
class CustomQueryMiddleware implements IMiddleware {
    calls: number = 0

    async execute(command: any, next: (command: any) => any): Promise<any> {
        this.calls++;
        return await next(command);
    }
}

describe("CustomType Middlewares", () => {
    it("It call custom middlewares present always before the resolver", async () => {
        expect.assertions(10);

        const customMiddleware = new CustomMiddleware();
        const customQueryMiddleware = new CustomQueryMiddleware();
        const queryResolver = new QueryHandlerResolver();
        const resolver = new CommandHandlerResolver();
        const demoHandler = new DemoHandler();
        const commandBus = new CommandBus(customMiddleware, resolver);
        const queryBus = new QueryBus(customQueryMiddleware, queryResolver);

        resolver.addHandler(DemoCommand, demoHandler);
        queryResolver.addHandler(DemoQuery, new DemoQueryHandler());

        const response: any = await queryBus.ask(new DemoQuery());
        expect(response.data).toBe("Hello!");
        expect(customQueryMiddleware.calls).toBe(1);

        try {
            await queryBus.ask(new DemoQuery(true));
            // tslint:disable-next-line:no-duplicate-string
            expect("Query bus Exception").toBe("Not threw");
        } catch (err) {
            expect((err as any).code).toBe(0);
        }

        expect(customQueryMiddleware.calls).toBe(2);

        await commandBus.handle(new DemoCommand(false));
        expect(demoHandler.received).toBeTruthy();
        expect(customMiddleware.calls).toBe(1);
        try {
            await queryBus.ask(new DemoQuery(true));
            expect("Exception Query").toBe("Not threw");
        } catch (err) {
            expect((err as any).code).toBe(0);
        }
        expect(customQueryMiddleware.calls).toBe(3);

        try {
            await commandBus.handle(new DemoCommand(true));
            expect("Exception Command").toBe("Not threw");
        } catch (err) {
            expect((err as Error).message).toBe("Fail");
        }
        expect(customMiddleware.calls).toBe(2);
    });
});
