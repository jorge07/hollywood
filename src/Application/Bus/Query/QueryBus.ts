import { IAppError, IAppResponse } from "../CallbackArg";
import MessaBus from "../MessageBus";
import IMiddleware from "../Middelware";
import IQuery from "./Query";
import QueryHandlerResolver from "./QueryResolver";

export default class QueryBus extends MessaBus {
    constructor(
        ...middlewares: IMiddleware[]
    ) {
        super(...middlewares);
    }
    public async ask(command: IQuery): Promise<IAppResponse|IAppError|null> {
        return await this.middlewareChain(command);
    }
}
