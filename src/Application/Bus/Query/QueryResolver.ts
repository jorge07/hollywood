import type { QueryBusResponse } from "../CallbackArg";
import type { IQueryRegistry } from "../CommandRegistry";
import type IMiddleware from "../Middleware";
import type { NextMiddleware } from "../Middleware";
import type IQuery from "./Query";
import type IQueryHandler from "./QueryHandler";
import MissingAutowiringAnnotationException from "../Exception/MissingAutowiringAnnotationException";
import type { IAnnotatedHandler } from "../autowiring";

/**
 * QueryHandlerResolver is a TERMINAL middleware handler for queries.
 *
 * It implements IMiddleware to participate in the middleware chain,
 * but it intentionally does NOT call next() because it is designed
 * to be the final handler in the chain that resolves and executes
 * the appropriate query handler.
 *
 * Usage: Always place this resolver as the LAST middleware in the chain.
 * Any middleware placed after this resolver will NOT be executed.
 */
export default class QueryHandlerResolver implements IMiddleware<IQuery, QueryBusResponse> {
    private readonly handlers: IQueryRegistry = {};

    /**
     * Execute the query by resolving its handler.
     *
     * Note: The `next` parameter is required by IMiddleware interface
     * but is intentionally not called as this is a terminal handler.
     *
     * @param query - The query to execute
     * @param _next - Unused. Terminal handler does not continue the chain.
     */
    public async execute(query: IQuery, _next: NextMiddleware<IQuery, QueryBusResponse>): Promise<QueryBusResponse> {
        return await this.resolve(query);
    }

    public addHandler(command: { name: string }, handler: IQueryHandler): QueryHandlerResolver {
        // Validate that handler has autowiring metadata
        const annotatedHandler = handler as IQueryHandler & Partial<IAnnotatedHandler<IQueryHandler>>;
        if (!annotatedHandler.command) {
            throw new MissingAutowiringAnnotationException(handler, 'handle');
        }

        this.handlers[command.name] = handler;

        return this;
    }

    private async resolve(query: IQuery): Promise<QueryBusResponse> {
        const handler = this.getHandlerFor(query);

        if (handler) {

            return await handler.handle(query);
        }

        return null;
    }

    private getHandlerFor(query: IQuery): IQueryHandler | undefined {
        const queryName = query.constructor.name;

        return this.handlers[queryName];
    }
}
