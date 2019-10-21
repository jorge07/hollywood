import { IAppError, IAppResponse } from "../CallbackArg";
import IQuery from "./Query";
import QueryHandlerResolver from "./QueryResolver";

export default class QueryBus {
    constructor(private readonly resolver: QueryHandlerResolver) {}

    public async ask(command: IQuery): Promise<IAppResponse|IAppError|null> {
        return await this.resolver.resolve(command);
    }
}
