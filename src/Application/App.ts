import { 
    CommandBus,
    ICommand,
    ICommandHandler, 
    CommandHandlerResolver,
    QueryBus, 
    IQuery,  
    IQueryHandler,
    QueryHandlerResolver, 
    IAppResponse, 
    IAppError,
} from '../Application/';

export default class App {
    private readonly commandResolver: CommandHandlerResolver;
    private readonly queryResolver: QueryHandlerResolver;
    private readonly commandBus: CommandBus;
    private readonly queryBus: QueryBus;
    
    constructor(commands: Map<any, ICommandHandler>, queries: Map<any, IQueryHandler>) {
        this.commandResolver = new CommandHandlerResolver();
        this.queryResolver = new QueryHandlerResolver();

        commands.forEach((handler: ICommandHandler, key: any) => this.registerCommand(key, handler));
        queries.forEach((handler: IQueryHandler, key: any) => this.registerQuery(key, handler));

        this.commandBus = new CommandBus(this.commandResolver);
        this.queryBus = new QueryBus(this.queryResolver);
    }

    public async ask(query: IQuery): Promise<IAppResponse|IAppError|null> {

        return this.queryBus.ask(query);
    }

    public async handle(command: ICommand): Promise<void|IAppError> {
        
        return this.commandBus.handle(command);
    }

    private registerCommand(command: any, handler: ICommandHandler): void {
        this.commandResolver.addHandler(command, handler)
    }

    private registerQuery(query: any, handler: IQueryHandler): void {
        this.queryResolver.addHandler(query, handler)
    }
}
