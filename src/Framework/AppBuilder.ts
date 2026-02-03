import type { interfaces } from "inversify";
import App, { CommandMiddleware, QueryMiddleware } from "../Application/App";
import type IQueryHandler from "../Application/Bus/Query/QueryHandler";
import * as Aliases from './Container/Bridge/Alias';
import type { IAnnotatedHandler } from "../Application/Bus/autowiring";
import MissingAutowiringAnnotationException from "../Application/Bus/Exception/MissingAutowiringAnnotationException";
import type IHandler from "../Application/Bus/IHandler";
import type ICommandHandler from "../Application/Bus/Command/CommandHandler";

function mapHandler<T extends IHandler>(handlers: T[], collection: Map<{ name: string }, T>): void {
    const commandName = (target: T & Partial<IAnnotatedHandler<T>>): { name: string } => {
        if (!target.command) {
            throw new MissingAutowiringAnnotationException(target);
        }
        return target.command;
    };

    if (handlers.length > 0) {
        for (const handler of handlers.filter(Boolean)) {
            collection.set(commandName(handler), handler);
        }
    }
}

export default function AppBuilder(container: interfaces.Container): App {
    const commands = new Map<{ name: string }, ICommandHandler>();
    const queries = new Map<{ name: string }, IQueryHandler>();

    const commandHandlers = container.getAll<ICommandHandler>(Aliases.SERVICES_ALIAS.COMMAND_HANDLERS)
    const queryHandlers = container.getAll<IQueryHandler>(Aliases.SERVICES_ALIAS.QUERY_HANDLERS)
    const commandMiddlewares = container.getAll<CommandMiddleware>(Aliases.SERVICES_ALIAS.COMMAND_MIDDLEWARE)
    const queryMiddlewares = container.getAll<QueryMiddleware>(Aliases.SERVICES_ALIAS.QUERY_MIDDLEWARE)

    mapHandler<ICommandHandler>(commandHandlers, commands);
    mapHandler<IQueryHandler>(queryHandlers, queries);

    return new App(commands, queries, commandMiddlewares, queryMiddlewares);
}
