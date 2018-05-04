import { IAppError, IAppResponse } from "../CallbackArg";
import IQuery from "./Query";
import QueryHandlerResolver from "./QueryResolver";

export default class QueryBus {
    constructor(private readonly handlerResolver: QueryHandlerResolver) {}

    public async ask(command: IQuery): Promise<IAppResponse|IAppError|null> {
        return await this.handlerResolver.resolve(command);
    }
}
