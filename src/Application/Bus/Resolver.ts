import { CommandRegistry } from "./CommandRegistry";
import IHandler from "./Handler";
import IRequest from "./Request";
import { AppResponse, AppError } from './Query/CallbackArg';

export default class HandlerResolver {

    private readonly handlers: CommandRegistry = <CommandRegistry>{};

    public resolve(command: IRequest, callback?: (error: AppResponse|AppError)=>void): void {
        const handler = this.getHandlerForCommand(command);

        handler && handler.handle(command, callback)
    }

    public addHandler(command: any, handler: IHandler): HandlerResolver {
        this.handlers[(command as any).name] = handler;

        return this;
    }

    private getHandlerForCommand(command: IRequest): IHandler | undefined {
        const commandName = (command as any).constructor.name;

        return this.handlers[commandName];
    }
}
