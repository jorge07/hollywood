import { IAppError } from "../CallbackArg";
import { ICommandRegistry } from "../CommandRegistry";
import IMiddleware from "../Middelware";
import ICommand from "./Command";
import ICommandHandler from "./CommandHandler";

export default class CommandHandlerResolver implements IMiddleware {

    private readonly handlers: ICommandRegistry = {};

    public async execute(command: any, next: (command: any) => void) {
        await this.resolve(command as ICommand);
    }

    public addHandler(command: { name: string }, handler: ICommandHandler): CommandHandlerResolver {
        this.handlers[command.name] = handler;

        return this;
    }

    private async resolve(command: ICommand): Promise<void|IAppError> {
        const handler = this.getHandlerForCommand(command);

        if (handler) {

            return await handler.handle(command);
        }
    }

    private getHandlerForCommand(command: ICommand): ICommandHandler | undefined {
        const commandName = command.constructor.name;

        return this.handlers[commandName];
    }
}
