import { CommandRegistry } from '../CommandRegistry';
import { AppResponse, AppError } from '../CallbackArg';
import ICommandHandler from './CommandHandler';
import ICommand from './Command';

export default class CommandHandlerResolver {

    private readonly handlers: CommandRegistry = {};
    
    async resolve(command: ICommand): Promise<void|AppError> {
        const handler = this.getHandlerForCommand(command);

        return await handler && handler.handle(command)
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
