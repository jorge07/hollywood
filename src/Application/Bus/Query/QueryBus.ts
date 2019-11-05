import { IAppError, IAppResponse } from "../CallbackArg";
import IQuery from "./Query";
import QueryHandlerResolver from "./QueryResolver";
import MessaBus from '../MessageBus';
import IMiddleware from '../Middelware';

export default class QueryBus extends MessaBus {
    constructor(
        ...middlewares: IMiddleware[]
    ) {
        super(...middlewares)
    }
    public async ask(command: IQuery): Promise<IAppResponse|IAppError|null> {
        return await this.middlewareChain(command);
    }
}
