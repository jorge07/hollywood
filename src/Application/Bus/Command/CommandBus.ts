import type { IAppError } from "../CallbackArg";
import MessageBus from "../MessageBus";
import type IMiddleware from "../Middleware";
import type ICommand from "./Command";
import type { CommandResponse } from "./CommandHandlerResolver";

export default class CommandBus extends MessageBus<ICommand, CommandResponse> {

    constructor(
        ...middlewares: IMiddleware<ICommand, CommandResponse>[]
    ) {
        super(...middlewares);
    }

    public async handle(command: ICommand): Promise<void | IAppError> {
        return await this.middlewareChain(command);
    }
}
