import { ICommandRegistry } from "./CommandRegistry";
import { IHandler } from "./Handler";
import { IRequest } from "./Request";

export class HandlerResolver {

    private handlers: ICommandRegistry = {};

    public async resolve(command: IRequest): Promise<any> {

        const handler = this.getHandlerForCommand(command);

        return handler ? handler.handle(command) : null;
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
