import type { IAppError } from "../CallbackArg";
import type { ICommandRegistry } from "../CommandRegistry";
import type IMiddleware from "../Middleware";
import type { NextMiddleware } from "../Middleware";
import type ICommand from "./Command";
import type ICommandHandler from "./CommandHandler";
import MissingAutowiringAnnotationException from "../Exception/MissingAutowiringAnnotationException";
import type { IAnnotatedHandler } from "../autowiring";

/** Response type for command execution */
export type CommandResponse = void | IAppError;

/**
 * CommandHandlerResolver is a TERMINAL middleware handler.
 *
 * It implements IMiddleware to participate in the middleware chain,
 * but it intentionally does NOT call next() because it is designed
 * to be the final handler in the chain that resolves and executes
 * the appropriate command handler.
 *
 * Usage: Always place this resolver as the LAST middleware in the chain.
 * Any middleware placed after this resolver will NOT be executed.
 */
export default class CommandHandlerResolver implements IMiddleware<ICommand, CommandResponse> {

    private readonly handlers: ICommandRegistry = {};

    /**
     * Execute the command by resolving its handler.
     *
     * Note: The `next` parameter is required by IMiddleware interface
     * but is intentionally not called as this is a terminal handler.
     *
     * @param command - The command to execute
     * @param _next - Unused. Terminal handler does not continue the chain.
     */
    public async execute(command: ICommand, _next: NextMiddleware<ICommand, CommandResponse>): Promise<CommandResponse> {
        return await this.resolve(command);
    }

    public addHandler(command: { name: string }, handler: ICommandHandler): CommandHandlerResolver {
        // Validate that handler has autowiring metadata
        const annotatedHandler = handler as ICommandHandler & Partial<IAnnotatedHandler<ICommandHandler>>;
        if (!annotatedHandler.command) {
            throw new MissingAutowiringAnnotationException(handler, 'handle');
        }

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
