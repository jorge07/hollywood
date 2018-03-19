import IRequest from "./Request";
import HandlerResolver from "./Resolver";
import { AppResponse, AppError } from './Query/CallbackArg';

export default class Bus {
    constructor(private readonly handlerResolver: HandlerResolver) {}

    public handle(command: IRequest, callback?: (error: AppResponse|AppError)=>void): void {
        this.handlerResolver.resolve(command, callback);
    }
}
