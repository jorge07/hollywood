import type { IAppError } from "../CallbackArg";
import type ICommand from "./Command";

export default interface ICommandHandler {
    handle(command: ICommand): Promise<void|IAppError>;
}
