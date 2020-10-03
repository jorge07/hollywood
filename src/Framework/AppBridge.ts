import { multiInject } from "inversify";
import type { ICommandHandler } from "../Application";
import App from "../Application/App";
import type ICommand from "../Application/Bus/Command/Command";
import type IMiddleware from "../Application/Bus/Middelware";
import type IQuery from "../Application/Bus/Query/Query";
import type IQueryHandler from "../Application/Bus/Query/QueryHandler";
import type { QueryBusResponse } from '../Application/Bus/CallbackArg';
import { SERVICES_ALIAS } from './Container/Bridge/Alias';
import type { IAnnotatedCommandHandler, IAnnotatedQueryHandler } from "../Application/Bus/autowiring";
import MissingAutowiringAnnotationException from "../Application/Bus/Exception/MissingAutowiringAnnotationException";

export default class AppBridge {
    private readonly app: App;

    constructor(
        @multiInject(SERVICES_ALIAS.COMMAND_HANDLERS)
        commandHandlers: IAnnotatedCommandHandler[],
        @multiInject(SERVICES_ALIAS.QUERY_HANDLERS)
        queryHandlers: IAnnotatedQueryHandler[],
        @multiInject(SERVICES_ALIAS.COMMAND_MIDDLEWARE)
        commandMiddleware: IMiddleware[] = [],
        @multiInject(SERVICES_ALIAS.QUERY_MIDDLEWARE)
        queryMiddleware: IMiddleware[] = [],
    ) {
        const commands = new Map<any, ICommandHandler>();
        const queries = new Map<any, IQueryHandler>();

        const commandName = (target: IAnnotatedCommandHandler|IAnnotatedQueryHandler ): { name: string } => {
            if (!target.command) {
                throw new MissingAutowiringAnnotationException(target);
            }

            return target.command;
        };

        if (!Array.isArray(commandHandlers[0])) {
            commandHandlers.forEach((handler: IAnnotatedCommandHandler) => {
                commands.set(
                    commandName(handler),
                    handler,
                );
            });
        }

        if (!Array.isArray(queryHandlers[0])) {
            queryHandlers.forEach((handler: IAnnotatedQueryHandler) => {
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
