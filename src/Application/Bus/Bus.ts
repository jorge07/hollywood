import {Request} from "./Request";
import {HandlerResolver} from "./Resolver";

export class Bus {

    constructor(private handlerResolver: HandlerResolver) {}

    public handle(command: Request): any {
        return this.handlerResolver.resolve(command);
    }
}
