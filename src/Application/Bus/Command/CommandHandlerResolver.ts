import type { IAppError } from "../CallbackArg";
import type { ICommandRegistry } from "../CommandRegistry";
import type IMiddleware from "../Middelware";
import type ICommand from "./Command";
import type ICommandHandler from "./CommandHandler";

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
