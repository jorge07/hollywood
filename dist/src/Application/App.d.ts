import type IMiddleware from "./Bus/Middelware";
import type ICommandHandler from "./Bus/Command/CommandHandler";
import type IQueryHandler from "./Bus/Query/QueryHandler";
import type { IAppError, IAppResponse } from "./Bus/CallbackArg";
import type IQuery from "./Bus/Query/Query";
import type ICommand from "./Bus/Command/Command";
export default class App {
    private readonly commandResolver;
    private readonly queryResolver;
    private readonly commandBus;
    private readonly queryBus;
    constructor(commands: Map<any, ICommandHandler>, queries: Map<any, IQueryHandler>, commandBusMiddlewares?: IMiddleware[], queryBusMiddlewares?: IMiddleware[]);
    ask(query: IQuery): Promise<IAppResponse | IAppError | null>;
    handle(command: ICommand): Promise<void>;
    private bindResolvers;
    private registerCommand;
    private registerQuery;
}
