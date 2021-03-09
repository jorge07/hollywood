import App from '../../src/Application/App';
import {DemoHandler, DemoCommand, DemoQuery, DemoQueryHandler} from './Bus/DemoHandlers';
import IMiddleware from '../../src/Application/Bus/Middelware';
import {IAppError, IAppResponse} from "../../src/Application/Bus/CallbackArg";

class CustomMiddleware implements IMiddleware {
    calls: number = 0

    async execute(command: any, next: (command: any) => any): Promise<any> {
        this.calls++;
        return await next(command);
    }
}

describe("App", () => {
    it("App should be able to handle Queries and Commands", async () => {
        const demoHandler = new DemoHandler();

        const app: App = new App(
            new Map([
                [ DemoCommand, demoHandler ]
            ]),
            new Map([
                [ DemoQuery, new DemoQueryHandler() ]
            ])
        );

        const response: IAppResponse | IAppError | null = await app.ask(new DemoQuery());

        expect(response).toMatchObject({data: 'Hello!'});

        await app.handle(new DemoCommand(false));

        expect(demoHandler.received).toBe(true);
    });

    it("App should be able to handle Queries and Commands and setup middlewares", async () => {
        const demoHandler = new DemoHandler();
        const Middleware = new CustomMiddleware();

        const app: App = new App(
            new Map([
                [ DemoCommand, demoHandler ]
            ]),
            new Map([
                [ DemoQuery, new DemoQueryHandler() ]
            ]),
            [Middleware],
            [Middleware]
        );

        const response: IAppResponse | IAppError | null = await app.ask(new DemoQuery());

        expect(response).toMatchObject({data: 'Hello!'});

        await app.handle(new DemoCommand(false));

        expect(demoHandler.received).toBe(true);
        expect(Middleware.calls).toBe(2);
    });
});
