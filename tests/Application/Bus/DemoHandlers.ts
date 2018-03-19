import {ICommand, ICommandHandler, IQuery, IQueryHandler} from "../../../src/Application/";
import { AppResponse, AppError } from '../../../src/Application/Bus/Query/CallbackArg';

export class DemoCommand implements ICommand {
}

export class DemoHandler implements ICommandHandler {

    public received: boolean = false;

    public handle(demo: DemoCommand, callback?: (error: AppResponse|AppError)=>void): void {
        this.received = true;
        callback(<AppResponse>{data: 'ack', meta: []})
    }
}

export class DemoQuery implements IQuery {

}

export class DemoQueryHandler implements IQueryHandler {
    public handle(query: DemoQuery): Promise<string> {
        return new Promise(() => ("Hello!"));
    }
}
