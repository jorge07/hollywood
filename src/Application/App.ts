import {
    CommandBus,
    CommandHandlerResolver,
    IAppError,
    IAppResponse,
    ICommand,
    ICommandHandler,
    IQuery,
    IQueryHandler,
    QueryBus,
    QueryHandlerResolver,
} from "../Application/";
import IMiddleware from "./Bus/Middelware";

export default class App {
    private readonly commandResolver: CommandHandlerResolver;
    private readonly queryResolver: QueryHandlerResolver;
    private readonly commandBus: CommandBus;
    private readonly queryBus: QueryBus;

    constructor(
        commands: Map<any, ICommandHandler>,
        queries: Map<any, IQueryHandler>,
        commandBusMiddewares: IMiddleware[] = [],
        queryBusMiddewares: IMiddleware[] = [],
    ) {
        this.commandResolver = new CommandHandlerResolver();
        this.queryResolver = new QueryHandlerResolver();

        this.bindResolvers(commands, queries);

        this.commandBus = new CommandBus(...commandBusMiddewares, this.commandResolver);
        this.queryBus = new QueryBus(...queryBusMiddewares, this.queryResolver);
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
