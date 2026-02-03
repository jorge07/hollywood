import type ICommand from "./Command/Command";
import type IQuery from "./Query/Query";

/**
 * Message type that can be processed by middleware.
 * Represents either a Command or a Query in the CQRS pattern.
 */
export type Message = ICommand | IQuery;

/**
 * Function signature for the next middleware in the chain.
 * @typeParam TMessage - The message type being processed
 * @typeParam TResponse - The response type returned by the chain
 */
export type NextMiddleware<TMessage extends Message, TResponse> = (message: TMessage) => Promise<TResponse>;

/**
 * Middleware interface for processing messages in a chain-of-responsibility pattern.
 * @typeParam TMessage - The message type this middleware processes
 * @typeParam TResponse - The response type this middleware returns
 */
export default interface IMiddleware<TMessage extends Message = Message, TResponse = unknown> {
    execute(message: TMessage, next: NextMiddleware<TMessage, TResponse>): Promise<TResponse>;
}
