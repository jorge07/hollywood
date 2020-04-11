import type ICommand from "./Command/Command";
import type IMiddleware from "./Middelware";

export default abstract class MessaBus {
    protected readonly middlewareChain: (command: ICommand) => any;

    constructor(
        ...middlewares: IMiddleware[]
    ) {
        this.middlewareChain = this.createChain(middlewares);
    }

    private createChain(middelwares: IMiddleware[]): (command: ICommand) => Promise<any> {
        const chain: {[key: string]: (command: ICommand) => any} = {};

        this.reverse(middelwares).forEach((middleware: IMiddleware, key: number) => {
            chain[key] = async (command: any): Promise<any> =>  {
                return await middleware.execute(command, chain[key - 1]);
            };
        });

        return chain[middelwares.length - 1];
    }

    private reverse(middelwares: IMiddleware[]): IMiddleware[] {
        return middelwares.reverse();
    }
}
