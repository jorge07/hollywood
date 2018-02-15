import {HandlerResolver} from "./Resolver";
import {Request} from "./Request";

export class Bus {

    constructor(private _handlerResolver: HandlerResolver) {}

    handle(command: Request): any {
        return this._handlerResolver.resolve(command)
    }
}
