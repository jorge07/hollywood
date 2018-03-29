import CommandHandlerResolver from './CommandHandlerResolver';
import { AppResponse, AppError } from '../CallbackArg';
import ICommand from './Command';

export default class Bus {
    constructor(private readonly handlerResolver: CommandHandlerResolver) {}

    public handle(command: ICommand, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void {
        this.handlerResolver.resolve(command, success, error);
    }
}
