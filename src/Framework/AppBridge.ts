import { multiInject } from "inversify";
import { isArray } from "util";
import { ICommandHandler } from "../Application";
import App from "../Application/App";
import { IAppError, IAppResponse } from "../Application/Bus/CallbackArg";
import ICommand from "../Application/Bus/Command/Command";
import IMiddleware from "../Application/Bus/Middelware";
import IQuery from "../Application/Bus/Query/Query";
import IQueryHandler from "../Application/Bus/Query/QueryHandler";

export default class AppBridge {
    private readonly app: App;

    constructor(
        @multiInject("application.command.handler")
        private readonly commandHandlers: ICommandHandler[],
        @multiInject("application.query.handler")
        private readonly queryHandlers: IQueryHandler[],
        @multiInject("application.command.middleware")
        private readonly commandMiddleware: IMiddleware[] = [],
        @multiInject("application.query.middleware")
        private readonly queryMiddleware: IMiddleware[] = [],
    ) {
        const commands = new Map<any, ICommandHandler>();
        const queries = new Map<any, IQueryHandler>();

        const commandName = (target: any ): string => {
            if (!target.command) {
                throw new Error(`Missinng @autowiring annotation in ${target.constructor.name} command`);
            }

            return target.command ;
        };
        if (!isArray(commandHandlers[0])) {
            commandHandlers.forEach((handler: ICommandHandler) => {
                commands.set(
                    commandName(handler),
                    handler,
                );
            });
        }

        if (!isArray(queryHandlers[0])) {
            queryHandlers.forEach((handler: IQueryHandler) => {
                queries.set(
                    commandName(handler),
                    handler,
                );
            });
        }

        this.app = new App(commands, queries);
    }

    public async ask(query: IQuery): Promise<IAppResponse|IAppError|null> {

        return await this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {

        await this.app.handle(command);
    }
}
