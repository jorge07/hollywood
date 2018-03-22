import {ICommand, ICommandHandler, IQuery, IQueryHandler} from "../../../src/Application/";
import { AppResponse, AppError } from '../../../src/Application/Bus/Query/CallbackArg';

export class DemoCommand implements ICommand {
}

export class DemoHandler implements ICommandHandler {
    public received: boolean = false

    handle(command: ICommand, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): void {
        this.received = true;
        success(<AppResponse>{data: 'ack', meta: []})
    }
}

export class DemoQuery implements IQuery {
}

export class DemoQueryHandler implements IQueryHandler {
    handle(request: DemoQuery, success?: (response: AppResponse)=>void, error?: (error: AppError)=>void): Promise<any> {
        return new Promise(() => ("Hello!"));
    }
}
