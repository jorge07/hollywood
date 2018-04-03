import { AppResponse, AppError } from '../CallbackArg';
import IQuery from './Query';

export default interface IQueryHandler {

    handle(request: IQuery): Promise<AppResponse|AppError>;
}
