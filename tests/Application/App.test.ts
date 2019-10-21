import App from '../../src/Application/App';
import { DemoHandler, DemoCommand, DemoQuery, DemoQueryHandler } from './Bus/DemoHandlers';
import { IAppResponse, IAppError } from '../../src/Application/Bus/CallbackArg';

describe("App", () => {
    it("App should be able to handle Queries and Commands", async () => {
        const demoHandler = new DemoHandler();

        const app: App = new App(
            new Map([
                [
                    DemoCommand, 
                    demoHandler
                ]
            ]),
            new Map([
                [
                    DemoQuery, 
                    new DemoQueryHandler()
                ]
            ])
        );

        const response: IAppResponse| IAppError = await app.ask(new DemoQuery());

        expect(response).toMatchObject({ data:'Hello!' });

        await app.handle(new DemoCommand(false));

        expect(demoHandler.received).toBe(true);
    });
});
