import { callbackify } from 'util';
import {HandlerResolver, IRequest} from "../../../src/Application/";
import {DemoCommand, DemoHandler, DemoQuery, DemoQueryHandler} from "./DemoHandlers";
import { AppResponse, AppError } from '../../../src/Application/Bus/Query/CallbackArg';

describe("HandlerResolver test suite", () => {
    it("It should routing to correct handler", () => {
        const resolver = new HandlerResolver();
        const demoHandler = new DemoHandler();

        resolver
            .addHandler(DemoCommand, demoHandler)
            .addHandler(DemoQuery, new DemoQueryHandler());

        const caller = (command: IRequest, callback: (response: AppResponse) => void, error: (response: AppError) => void): void => {
            resolver.resolve(command, callback, error);
        };

        caller(new DemoQuery(), (result) => expect(result).toBe("Hello!"), (result) => expect(result).toBe(undefined));

        caller(new DemoCommand(), (res: AppResponse) => (expect(res.data).toBe('ack')), (result) => expect(result).toBe(undefined));

        expect(demoHandler.received).toBeTruthy();
    });
});
