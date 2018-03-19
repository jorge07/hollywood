import IRequest from "./Request";
import { AppResponse, AppError } from './Query/CallbackArg';

export default interface IHandler {

    handle(request: IRequest, callback?: (error: AppResponse|AppError)=>void): void;
}
