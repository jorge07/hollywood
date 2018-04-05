import QueryHandlerResolver from './QueryResolver';
import IQuery from './Query';
import { AppResponse, AppError } from '../CallbackArg';

export default class QueryBus {
    constructor(private readonly handlerResolver: QueryHandlerResolver) {}

    public async ask(command: IQuery): Promise<AppResponse|AppError> {
        return await this.handlerResolver.resolve(command);
    }
}
