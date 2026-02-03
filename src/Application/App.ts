import CommandHandlerResolver, { CommandResponse } from "./Bus/Command/CommandHandlerResolver";
import QueryHandlerResolver from "./Bus/Query/QueryResolver";
import CommandBus from "./Bus/Command/CommandBus";
import QueryBus from "./Bus/Query/QueryBus";
import type IMiddleware from "./Bus/Middleware";
import type ICommandHandler from "./Bus/Command/CommandHandler";
import type IQueryHandler from "./Bus/Query/QueryHandler";
import type { IAppError, IAppResponse, QueryBusResponse } from "./Bus/CallbackArg";
import type IQuery from "./Bus/Query/Query";
import type ICommand from "./Bus/Command/Command";

/** Middleware type for the command bus */
export type CommandMiddleware = IMiddleware<ICommand, CommandResponse>;

/** Middleware type for the query bus */
export type QueryMiddleware = IMiddleware<IQuery, QueryBusResponse>;

/** Constructor type for commands and queries */
type MessageConstructor = { name: string };

export default class App {
    private readonly commandResolver: CommandHandlerResolver;
    private readonly queryResolver: QueryHandlerResolver;
    private readonly commandBus: CommandBus;
    private readonly queryBus: QueryBus;

    constructor(
        commands: Map<MessageConstructor, ICommandHandler>,
        queries: Map<MessageConstructor, IQueryHandler>,
        commandBusMiddlewares: CommandMiddleware[] = [],
        queryBusMiddlewares: QueryMiddleware[] = [],
    ) {
        this.commandResolver = new CommandHandlerResolver();
        this.queryResolver = new QueryHandlerResolver();

        this.bindResolvers(commands, queries);

        this.commandBus = new CommandBus(...commandBusMiddlewares, this.commandResolver);
        this.queryBus = new QueryBus(...queryBusMiddlewares, this.queryResolver);
    }

    public async ask(query: IQuery): Promise<IAppResponse | IAppError | null> {

        return this.queryBus.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.commandBus.handle(command);
    }

    private bindResolvers(
        commands: Map<MessageConstructor, ICommandHandler>,
        queries: Map<MessageConstructor, IQueryHandler>
    ): void {
        commands.forEach((handler: ICommandHandler, key: MessageConstructor) => this.registerCommand(key, handler));
        queries.forEach((handler: IQueryHandler, key: MessageConstructor) => this.registerQuery(key, handler));
    }

    private registerCommand(command: MessageConstructor, handler: ICommandHandler): void {
        this.commandResolver.addHandler(command, handler);
    }

    private registerQuery(query: MessageConstructor, handler: IQueryHandler): void {
        this.queryResolver.addHandler(query, handler);
    }
}
