import { IAppError, IAppResponse } from "../CallbackArg";
import { IQueryRegistry } from "../CommandRegistry";
import IQuery from "./Query";
import IQueryHandler from "./QueryHandler";

export default class QueryHandlerResolver {

    private readonly handlers: IQueryRegistry = {};

    public async resolve(command: IQuery): Promise<IAppResponse|IAppError|null> {
        const handler = this.getHandlerForCommand(command);

        if (! handler) {
            return null;
        }

        return await handler.handle(command);
    }

    public addHandler(command: any, handler: IQueryHandler): QueryHandlerResolver {
        this.handlers[(command as any).name] = handler;

        return this;
    }

    private getHandlerForCommand(command: IQuery): IQueryHandler | undefined {
        const commandName = (command as any).constructor.name;

        return this.handlers[commandName];
    }
}
