import IHandler from "../Handler";
import ICommand from "./Command";
import { AppResponse, AppError } from '../Query/CallbackArg';

export default interface ICommandHandler extends IHandler {

    handle(command: ICommand, callback?: (error: AppResponse|AppError)=>void): void;
}
