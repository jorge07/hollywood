import { IAppError } from "../CallbackArg";
import { ICommandRegistry } from "../CommandRegistry";
import ICommand from "./Command";
import ICommandHandler from "./CommandHandler";

export default class CommandHandlerResolver {

    private readonly handlers: ICommandRegistry = {};

    public async resolve(command: ICommand): Promise<void|IAppError> {
        const handler = this.getHandlerForCommand(command);

        if (handler) {

            return await handler.handle(command);
        }
    }

    public addHandler(command: { name: string }, handler: ICommandHandler): CommandHandlerResolver {
        this.handlers[command.name] = handler;

        return this;
    }

    private getHandlerForCommand(command: ICommand): ICommandHandler | undefined {
        const commandName = command.constructor.name;

        return this.handlers[commandName];
    }
}
