import { IAppError } from "../CallbackArg";
import ICommand from "./Command";

export default interface ICommandHandler {

    handle(command: ICommand): Promise<void|IAppError>;
}
