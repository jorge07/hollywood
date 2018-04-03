import { CommandHandlerResolver, ICommand, QueryHandlerResolver, AppResponse, AppError, IQuery } from "../../../src/Application/";
import { DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler } from "./DemoHandlers";

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", async () => {
        expect.assertions(5)

        const queryResolver = new QueryHandlerResolver();
        const resolver = new CommandHandlerResolver();
        const demoHandler = new DemoHandler();

        resolver
            .addHandler(DemoCommand, demoHandler);
        queryResolver
            .addHandler(DemoQuery, new DemoQueryHandler());

        const commandCaller = async (command: ICommand): Promise<any> => {
            return await resolver.resolve(command);
        };
        const queryCaller = async (command: IQuery): Promise<any> => {
            return await queryResolver.resolve(command);
        };

        const response = await queryCaller(new DemoQuery());
        expect(response.data).toBe('Hello!');

        try {
            await queryCaller(new DemoQuery(true));
            expect('Exception').toBe('Not throwed');           
        } catch (err) {
            expect(err.code).toBe(0);
        }

        const res: AppResponse = await commandCaller(new DemoCommand(false));
        expect(demoHandler.received).toBeTruthy();

        try {
            await queryCaller(new DemoQuery(true));
            expect('Exception Query').toBe('Not throwed');           
        } catch (err) {
            expect(err.code).toBe(0);
        }

        try {
            const resp = await commandCaller(new DemoCommand(true));
            expect('Exception Command').toBe('Not throwed');           
        } catch(err) {
            expect(err.message).toBe("Fail")
        }
    });
});
