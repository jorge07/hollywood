import { CommandRegistry } from '../CommandRegistry';
import { AppResponse, AppError } from '../CallbackArg';
import ICommandHandler from './CommandHandler';
import ICommand from './Command';

export default class CommandHandlerResolver {

    private readonly handlers: CommandRegistry = {};

    resolve(command: ICommand, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void {
        const handler = this.getHandlerForCommand(command);

        handler && handler.handle(command, success, error)
    }

    addHandler(command: any, handler: ICommandHandler): CommandHandlerResolver {
        this.handlers[(command as any).name] = handler;

        return this;
    }

    private getHandlerForCommand(command: ICommand): ICommandHandler | undefined {
        const commandName = (command as any).constructor.name;

        return this.handlers[commandName];
    }
}
