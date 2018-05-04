import { IAppError } from "../CallbackArg";
import { ICommandRegistry } from "../CommandRegistry";
import ICommand from "./Command";
import ICommandHandler from "./CommandHandler";

export default class CommandHandlerResolver {

    private readonly handlers: ICommandRegistry = {};

    public async resolve(command: ICommand): Promise<void|IAppError> {
        const handler = this.getHandlerForCommand(command);

        if (handler !== undefined && handler !== null) {

            return await handler.handle(command);
        }
    }

    public addHandler(command: any, handler: ICommandHandler): CommandHandlerResolver {
        this.handlers[(command as any).name] = handler;

        return this;
    }

    private getHandlerForCommand(command: ICommand): ICommandHandler | undefined {
        const commandName = (command as any).constructor.name;

        return this.handlers[commandName];
    }
}
