import { CommandHandlerResolver, ICommand, QueryHandlerResolver, AppResponse, AppError, IQuery } from "../../../src/Application/";
import { DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler } from "./DemoHandlers";

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", async () => {
        expect.assertions(4)

        const resolver = new CommandHandlerResolver();
        const queryResolver = new QueryHandlerResolver();
        const demoHandler = new DemoHandler();

        resolver
            .addHandler(DemoCommand, demoHandler);
        queryResolver
            .addHandler(DemoQuery, new DemoQueryHandler());

        const commandCaller = (command: ICommand, callback: (response: AppResponse) => void, error?: (response: AppError) => void): void => {
            resolver.resolve(command, callback, error);
        };
        const queryCaller = async (command: IQuery): Promise<any> => {
            return queryResolver.resolve(command);
        };

        const response = await queryCaller(new DemoQuery());
        expect(response).toBe('Hello!');

        commandCaller(new DemoCommand(false), (res: AppResponse) => (expect(res.data).toBe('ack')));
        commandCaller(new DemoCommand(true), (res: AppResponse) => {}, (result) => expect(result.message).toBe("Fail"));
        expect(demoHandler.received).toBeTruthy();
    });
});
