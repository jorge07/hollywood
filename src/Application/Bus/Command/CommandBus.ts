import { IAppError } from "../CallbackArg";
import IMiddleware from "../Middelware";
import ICommand from "./Command";
import CommandHandlerResolver from "./CommandHandlerResolver";
import MessaBus from '../MessageBus';

export default class CommandBus extends MessaBus {

    constructor(
        ...middlewares: IMiddleware[]
    ) {
        super(...middlewares)
    }

    public async handle(command: ICommand): Promise<void|IAppError> {
        await this.middlewareChain(command);
    }
}
