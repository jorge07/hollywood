import { IRequest } from "./Request";
import {HandlerResolver} from "./Resolver";

export class Bus {

    constructor(private handlerResolver: HandlerResolver) {}

    public handle(command: IRequest): any {
        return this.handlerResolver.resolve(command);
    }
}
