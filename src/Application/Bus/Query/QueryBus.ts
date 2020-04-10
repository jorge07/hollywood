import type { QueryBusResponse } from '../CallbackArg';
import MessageBus from "../MessageBus";
import type IMiddleware from "../Middelware";
import type IQuery from "./Query";

export default class QueryBus extends MessageBus {
    constructor(
        ...middlewares: IMiddleware[]
    ) {
        super(...middlewares);
    }
    public async ask(command: IQuery): Promise<QueryBusResponse> {
        return await this.middlewareChain(command);
    }
}
