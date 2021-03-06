import type ICommand from "./Command/Command";
import type IMiddleware from "./Middelware";

export default abstract class MessageBus {
    protected readonly middlewareChain: (command: ICommand) => any;

    protected constructor(
        ...middlewares: IMiddleware[]
    ) {
        this.middlewareChain = this.createChain(middlewares.filter(Boolean));
    }

    private createChain(middlewares: IMiddleware[]): (command: ICommand) => Promise<any> {
        const chain: {[key: string]: (command: ICommand) => any} = {};

        MessageBus.reverse(middlewares).filter(Boolean).forEach((middleware: IMiddleware, key: number) => {
            chain[key] = async (command: any): Promise<any> =>  (middleware.execute(command, chain[key - 1]));
        });

        return chain[middlewares.length - 1];
    }

    private static reverse(middlewares: IMiddleware[]): IMiddleware[] {
        return middlewares.reverse();
    }
}
