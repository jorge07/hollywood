/**
 * Represents a successful application response with typed data and metadata.
 * @typeParam TData - The type of data returned in the response
 * @typeParam TMeta - The type of metadata items in the response
 */
export interface IAppResponse<TData = unknown, TMeta = unknown> {
    data: TData;
    meta: TMeta[];
}

/**
 * Represents an application error response.
 * Optionally includes partial response data for error context.
 */
export interface IAppError extends Partial<IAppResponse<unknown, unknown>> {
    message: string;
    code: number;
}

/**
 * Union type for QueryBus responses.
 * Can be a successful response, an error, or null if no handler is found.
 */
export type QueryBusResponse<TData = unknown, TMeta = unknown> = IAppResponse<TData, TMeta> | IAppError | null;
