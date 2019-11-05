import { IAppError } from "../CallbackArg";
import MessaBus from "../MessageBus";
import IMiddleware from "../Middelware";
import ICommand from "./Command";
import CommandHandlerResolver from "./CommandHandlerResolver";

export default class CommandBus extends MessaBus {

    constructor(
        ...middlewares: IMiddleware[]
    ) {
        super(...middlewares);
    }

    public async handle(command: ICommand): Promise<void|IAppError> {
        await this.middlewareChain(command);
    }
}
