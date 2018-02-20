import {Handler} from "./Handler";
import {Request} from "./Request";
import {CommandRegistry} from "./CommandRegistry";

export class HandlerResolver {

    private _handlers: CommandRegistry = {};

    async resolve(command: Request): Promise<any> {

        const handler = this.getHandlerForCommand(command);

        return handler ? handler.handle(command) : null;
    }

    addHandler(command: any, handler: Handler): HandlerResolver {
        this._handlers[(<any> command).name] = handler;

        return this
    }

    private getHandlerForCommand(command: Request): Handler | undefined {
        let commandName = (<any> command).constructor.name;

        return this._handlers[commandName];
    }
}