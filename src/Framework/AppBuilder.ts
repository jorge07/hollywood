import { interfaces } from "inversify";
import App from "../Application/App";
import type ICommand from "../Application/Bus/Command/Command";
import type IMiddleware from "../Application/Bus/Middelware";
import type IQuery from "../Application/Bus/Query/Query";
import type IQueryHandler from "../Application/Bus/Query/QueryHandler";
import type { QueryBusResponse } from '../Application/Bus/CallbackArg';
import * as Aliases from './Container/Bridge/Alias';
import type { IAnnotatedHandler } from "../Application/Bus/autowiring";
import MissingAutowiringAnnotationException from "../Application/Bus/Exception/MissingAutowiringAnnotationException";
import type IHandler from "../Application/Bus/IHandler";
import type ICommandHandler from "../Application/Bus/Command/CommandHandler";

export default class AppBuilder {
    private readonly app: App;

    constructor(container: interfaces.Container) {
        const commands = new Map<{ name: string }, ICommandHandler>();
        const queries = new Map<{ name: string }, IQueryHandler>();

        const commandHandlers = container.getAll<ICommandHandler>(Aliases.SERVICES_ALIAS.COMMAND_HANDLERS)
        const queryHandlers = container.getAll<IQueryHandler>(Aliases.SERVICES_ALIAS.QUERY_HANDLERS)
        const commandMiddlewares = container.getAll<IMiddleware>(Aliases.SERVICES_ALIAS.COMMAND_MIDDLEWARE)
        const queryMiddlewares = container.getAll<IMiddleware>(Aliases.SERVICES_ALIAS.QUERY_MIDDLEWARE)


        AppBuilder.mapHandler<ICommandHandler>(commandHandlers, commands);
        AppBuilder.mapHandler<IQueryHandler>(queryHandlers, queries);

        this.app = new App(commands, queries, commandMiddlewares, queryMiddlewares);
    }

    private static mapHandler<T extends IHandler>(handlers: T[], collection: Map<{ name: string }, T>): void {
        const commandName = (target: IAnnotatedHandler<T> ): { name: string } => {
            if (!target.command) {
                throw new MissingAutowiringAnnotationException(target);
            }
            return target.command;
        };

        if (handlers.length > 0) {
            for (const handler of handlers.filter(Boolean)) {
                collection.set(commandName(handler as any), handler);
            }
        }
    }

    public async ask(query: IQuery): Promise<QueryBusResponse> {

        return this.app.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {

        await this.app.handle(command);
    }
}
