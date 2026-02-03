import type { QueryBusResponse } from '../CallbackArg';
import MessageBus from "../MessageBus";
import type IMiddleware from "../Middleware";
import type IQuery from "./Query";

export default class QueryBus extends MessageBus<IQuery, QueryBusResponse> {
    constructor(
        ...middlewares: IMiddleware<IQuery, QueryBusResponse>[]
    ) {
        super(...middlewares);
    }
    public async ask(query: IQuery): Promise<QueryBusResponse> {
        return await this.middlewareChain(query);
    }
}
