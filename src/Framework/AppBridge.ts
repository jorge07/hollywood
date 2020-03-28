import { multiInject } from "inversify";
import { isArray } from "util";
import { ICommandHandler } from "../Application";
import App from "../Application/App";
import ICommand from "../Application/Bus/Command/Command";
import IMiddleware from "../Application/Bus/Middelware";
import IQuery from "../Application/Bus/Query/Query";
import IQueryHandler from "../Application/Bus/Query/QueryHandler";
import { QueryBusResponse } from '../Application/Bus/CallbackArg';
import { SERVICES_ALIAS } from './Container/Bridge/Alias';

export default class AppBridge {
    private readonly app: App;

    constructor(
        @multiInject(SERVICES_ALIAS.COMMAND_HANDLERS)
        private readonly commandHandlers: ICommandHandler[],
        @multiInject(SERVICES_ALIAS.QUERY_HANDLERS)
        private readonly queryHandlers: IQueryHandler[],
        @multiInject(SERVICES_ALIAS.COMMAND_MIDDLEWARE)
        private readonly commandMiddleware: IMiddleware[] = [],
        @multiInject(SERVICES_ALIAS.QUERY_MIDDLEWARE)
        private readonly queryMiddleware: IMiddleware[] = [],
    ) {
        const commands = new Map<any, ICommandHandler>();
        const queries = new Map<any, IQueryHandler>();

        const commandName = (target: any ): string => {
            if (!target.command) {
                throw new Error(`Missinng @autowiring annotation in ${target.constructor.name} command/query`);
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

    public async ask(query: IQuery): Promise<QueryBusResponse> {

        return await this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {

        await this.app.handle(command);
    }
}
