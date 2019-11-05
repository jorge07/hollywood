import ICommand from './Command/Command';
import IMiddleware from './Middelware';
import { IAppError } from './CallbackArg';

export default abstract class MessaBus {
    protected readonly middlewareChain: (command: ICommand) => any;

    constructor(
        ...middlewares: IMiddleware[]
    ) {
        this.middlewareChain = this.createChain(middlewares);
    }

    private createChain(middelwares: IMiddleware[]): (command: ICommand) => Promise<any> {
        const lastCallable = async (command: any): Promise<void> => {
            // the final callable is a no-op
        };

        const chain: {[key: string]: (command: ICommand) => any} = {};

        middelwares.reverse().forEach((middleware: IMiddleware, key: number) => {
            chain[key] = async (command: any): Promise<any> =>  {
                return await middleware.execute(command, chain[key - 1]);
            };
        });

        return chain[middelwares.length - 1];
    }
}
