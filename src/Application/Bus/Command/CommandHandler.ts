import ICommand from "./Command";
import { AppResponse, AppError } from '../CallbackArg';

export default interface ICommandHandler {

    handle(command: ICommand, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void;
}
