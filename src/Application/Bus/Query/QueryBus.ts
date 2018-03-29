import QueryHandlerResolver from './QueryResolver';
import IQuery from './Query';

export default class QueryBus {
    constructor(private readonly handlerResolver: QueryHandlerResolver) {}

    public async handle(command: IQuery): Promise<any> {
        return await this.handlerResolver.resolve(command);
    }
}
