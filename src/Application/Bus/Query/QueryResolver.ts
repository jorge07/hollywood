import IQueryHandler from './QueryHandler';
import { QueryRegistry } from '../CommandRegistry';
import IQuery from './Query';

export default class QueryHandlerResolver {

    private readonly handlers: QueryRegistry = {};

    async resolve(command: IQuery): Promise<any> {
        const handler = this.getHandlerForCommand(command);

        if (! handler) {
            return null;
        }

        return handler.handle(command)
    }

    addHandler(command: any, handler: IQueryHandler): QueryHandlerResolver {
        this.handlers[(command as any).name] = handler;

        return this;
    }

    private getHandlerForCommand(command: IQuery): IQueryHandler | undefined {
        const commandName = (command as any).constructor.name;

        return this.handlers[commandName];
    }
}
