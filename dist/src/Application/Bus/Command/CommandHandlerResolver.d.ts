import type IMiddleware from "../Middelware";
import type ICommandHandler from "./CommandHandler";
export default class CommandHandlerResolver implements IMiddleware {
    private readonly handlers;
    execute(command: any, next: (command: any) => void): Promise<void>;
    addHandler(command: {
        name: string;
    }, handler: ICommandHandler): CommandHandlerResolver;
    private resolve;
    private getHandlerForCommand;
}
