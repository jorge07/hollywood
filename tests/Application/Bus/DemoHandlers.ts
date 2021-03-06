import autowiring from '../../../src/Application/Bus/autowiring';
import ICommandHandler from "../../../src/Application/Bus/Command/CommandHandler";
import ICommand from "../../../src/Application/Bus/Command/Command";
import {IAppError, IAppResponse} from "../../../src/Application/Bus/CallbackArg";
import IQuery from "../../../src/Application/Bus/Query/Query";
import IQueryHandler from "../../../src/Application/Bus/Query/QueryHandler";
import {injectable} from "inversify";

export class DemoCommand implements ICommand {
    constructor(public readonly exception: boolean) {
    }
}

// tslint:disable-next-line:max-classes-per-file
@injectable()
export class DemoHandler implements ICommandHandler {
    public received: boolean = false;

    @autowiring
    public async handle(command: DemoCommand): Promise<void | IAppError> {
        this.received = true;
        if (command.exception) {
            throw {code: 1, message: "Fail"};
        }
    }
}

// tslint:disable-next-line:max-classes-per-file
export class DemoQuery implements IQuery {
    constructor(public readonly exception: boolean = false) {
    }
}


// tslint:disable-next-line:max-classes-per-file
@injectable()
export class DemoQueryHandler implements IQueryHandler {
    @autowiring
    public async handle(request: DemoQuery): Promise<IAppResponse | IAppError> {
        if (request.exception) {
            throw {code: 0, message: "Fail"} as IAppError;
        }

        return {data: "Hello!"} as IAppResponse;
    }
}


// tslint:disable-next-line:max-classes-per-file
@injectable()
export class MissingAnnotationDemoQueryHandler implements IQueryHandler {
    public async handle(request: DemoQuery): Promise<IAppResponse | IAppError> {
        // noop
        return {
            message: "ops",
            code: 1
        };
    }
}
