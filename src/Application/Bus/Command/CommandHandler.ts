import ICommand from "./Command";
import { AppResponse, AppError } from '../CallbackArg';

export default interface ICommandHandler {

    handle(command: ICommand): Promise<void|AppError>;
}
