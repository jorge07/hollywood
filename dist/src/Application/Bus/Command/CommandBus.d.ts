import type { IAppError } from "../CallbackArg";
import MessageBus from "../MessageBus";
import type IMiddleware from "../Middelware";
import type ICommand from "./Command";
export default class CommandBus extends MessageBus {
    constructor(...middlewares: IMiddleware[]);
    handle(command: ICommand): Promise<void | IAppError>;
}
