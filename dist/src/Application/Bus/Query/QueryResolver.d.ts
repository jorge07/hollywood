import IMiddleware from "../Middelware";
import IQueryHandler from "./QueryHandler";
export default class QueryHandlerResolver implements IMiddleware {
    private readonly handlers;
    execute(command: any, next: (command: any) => any): Promise<any>;
    addHandler(command: {
        name: string;
    }, handler: IQueryHandler): QueryHandlerResolver;
    private resolve;
    private getHandlerFor;
}
