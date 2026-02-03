import type IMiddleware from "./Middleware";
import type { Message, NextMiddleware } from "./Middleware";

/**
 * Abstract base class for message buses implementing the middleware pattern.
 * @typeParam TMessage - The type of message this bus processes (Command or Query)
 * @typeParam TResponse - The type of response returned by the middleware chain
 */
export default abstract class MessageBus<TMessage extends Message, TResponse> {
    protected readonly middlewareChain: (message: TMessage) => Promise<TResponse>;

    protected constructor(
        ...middlewares: IMiddleware<TMessage, TResponse>[]
    ) {
        this.middlewareChain = this.createChain(middlewares.filter(Boolean));
    }

    private createChain(middlewares: IMiddleware<TMessage, TResponse>[]): (message: TMessage) => Promise<TResponse> {
        const chain: Record<number, NextMiddleware<TMessage, TResponse>> = {};

        MessageBus.reverse(middlewares).filter(Boolean).forEach((middleware: IMiddleware<TMessage, TResponse>, key: number) => {
            chain[key] = async (message: TMessage): Promise<TResponse> => middleware.execute(message, chain[key - 1]);
        });

        return chain[middlewares.length - 1];
    }

    private static reverse<T>(middlewares: T[]): T[] {
        return middlewares.reverse();
    }
}
