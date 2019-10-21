import { IAppError } from "../CallbackArg";
import ICommand from "./Command";
import CommandHandlerResolver from "./CommandHandlerResolver";

export default class CommandBus {
    constructor(private readonly resolver: CommandHandlerResolver) {}

    public async handle(command: ICommand): Promise<void|IAppError> {
        await this.resolver.resolve(command);
    }
}
