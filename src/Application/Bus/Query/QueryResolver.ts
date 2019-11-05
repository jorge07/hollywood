import { IAppError, IAppResponse } from "../CallbackArg";
import { IQueryRegistry } from "../CommandRegistry";
import IMiddleware from "../Middelware";
import IQuery from "./Query";
import IQueryHandler from "./QueryHandler";

export default class QueryHandlerResolver implements IMiddleware {
    private readonly handlers: IQueryRegistry = {};

    public async execute(command: any, next: (command: any) => any): Promise<any> {
        return await this.resolve(command);
    }

    public addHandler(command: any, handler: IQueryHandler): QueryHandlerResolver {
        this.handlers[command.name] = handler;

        return this;
    }

    private async resolve(command: IQuery): Promise<IAppResponse|IAppError|null> {
        const handler = this.getHandlerFor(command);

        if (handler) {

            return await handler.handle(command);
        }

        return null;
    }

    private getHandlerFor(command: IQuery): IQueryHandler | undefined {
        const commandName = command.constructor.name;

        return this.handlers[commandName];
    }
}
