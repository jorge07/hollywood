import CommandHandlerResolver from './CommandHandlerResolver';
import { AppResponse, AppError } from '../CallbackArg';
import ICommand from './Command';

export default class CommandBus {
    constructor(private readonly handlerResolver: CommandHandlerResolver) {}

    async handle(command: ICommand): Promise<void|AppError> {
        await this.handlerResolver.resolve(command);
    }
}
