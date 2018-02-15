import {Handler} from "./Handler";
import {Request} from "./Request";
import {CommandRegistry} from "./CommandRegistry";

export class HandlerResolver {

    private _handlers: CommandRegistry = {};

    async resolve(command: Request): Promise<any> {
        const handler = this.getHandlerForCommand(command);

        return handler.handle(command)
    }

    addHandler(command: Request, handler: Handler): HandlerResolver {
        const commandStringName = HandlerResolver.commandName(command);

        this._handlers[commandStringName] = handler;

        return this
    }

    private getHandlerForCommand(command: Request): Handler | undefined {
        let commandName = HandlerResolver.commandName(command);

        return this._handlers[commandName];
    }

    private static commandName(command: Request): string {
        return (<any> command).constructor.name;
    }
}