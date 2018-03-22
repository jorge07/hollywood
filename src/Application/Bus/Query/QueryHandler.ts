import IHandler from "../Handler";
import IQuery from './Query';
import { AppResponse, AppError } from './CallbackArg';

export default interface IQueryHandler extends IHandler {

    handle(request: IQuery, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void|Promise<any>;
}
