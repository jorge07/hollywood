import CommandHandlerResolver from "./Bus/Command/CommandHandlerResolver";
import QueryHandlerResolver from "./Bus/Query/QueryResolver";
import CommandBus from "./Bus/Command/CommandBus";
import QueryBus from "./Bus/Query/QueryBus";
import type IMiddleware from "./Bus/Middelware";
import type ICommandHandler from "./Bus/Command/CommandHandler";
import type IQueryHandler from "./Bus/Query/QueryHandler";
import type {IAppError, IAppResponse} from "./Bus/CallbackArg";
import type IQuery from "./Bus/Query/Query";
import type ICommand from "./Bus/Command/Command";

export default class App {
    private readonly commandResolver: CommandHandlerResolver;
    private readonly queryResolver: QueryHandlerResolver;
    private readonly commandBus: CommandBus;
    private readonly queryBus: QueryBus;

    constructor(
        commands: Map<any, ICommandHandler>,
        queries: Map<any, IQueryHandler>,
        commandBusMiddlewares: IMiddleware[] = [],
        queryBusMiddlewares: IMiddleware[] = [],
    ) {
        this.commandResolver = new CommandHandlerResolver();
        this.queryResolver = new QueryHandlerResolver();

        this.bindResolvers(commands, queries);

        this.commandBus = new CommandBus(...commandBusMiddlewares, this.commandResolver);
        this.queryBus = new QueryBus(...queryBusMiddlewares, this.queryResolver);
    }

    public async ask(query: IQuery): Promise<IAppResponse|IAppError|null> {

        return await this.queryBus.ask(query);
    }

    public async handle(command: ICommand): Promise<void> {
        await this.commandBus.handle(command);
    }

    private bindResolvers(commands: Map<any, ICommandHandler>, queries: Map<any, IQueryHandler>): void {
        commands.forEach((handler: ICommandHandler, key: any) => this.registerCommand(key, handler));
        queries.forEach((handler: IQueryHandler, key: any) => this.registerQuery(key, handler));
    }

    private registerCommand(command: any, handler: ICommandHandler): void {
        this.commandResolver.addHandler(command, handler);
    }

    private registerQuery(query: any, handler: IQueryHandler): void {
        this.queryResolver.addHandler(query, handler);
    }
}
