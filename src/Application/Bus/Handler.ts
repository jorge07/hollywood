import IRequest from "./Request";
import { AppResponse, AppError } from './Query/CallbackArg';

export default interface IHandler {

    handle(request: IRequest, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void;
}
