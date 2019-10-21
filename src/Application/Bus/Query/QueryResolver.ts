import { IAppError, IAppResponse } from "../CallbackArg";
import { IQueryRegistry } from "../CommandRegistry";
import IQuery from "./Query";
import IQueryHandler from "./QueryHandler";

export default class QueryHandlerResolver {

    private readonly handlers: IQueryRegistry = {};

    public async resolve(command: IQuery): Promise<IAppResponse|IAppError|null> {
        const handler = this.getHandlerFor(command);

        if (handler) {

            return await handler.handle(command);
        }

        return null;
    }

    public addHandler(command: any, handler: IQueryHandler): QueryHandlerResolver {
        this.handlers[command.name] = handler;

        return this;
    }

    private getHandlerFor(command: IQuery): IQueryHandler | undefined {
        const commandName = command.constructor.name;

        return this.handlers[commandName];
    }
}
