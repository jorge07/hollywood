import type ICommand from "./Command/Command";
import type IMiddleware from "./Middelware";
export default abstract class MessageBus {
    protected readonly middlewareChain: (command: ICommand) => any;
    protected constructor(...middlewares: IMiddleware[]);
    private createChain;
    private static reverse;
}
