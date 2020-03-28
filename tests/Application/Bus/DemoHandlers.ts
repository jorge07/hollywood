import { IAppError, IAppResponse, ICommand, ICommandHandler, IQuery, IQueryHandler} from "../../../src/Application/";
import autowiring from '../../../src/Application/Bus/autowiring';

export class DemoCommand implements ICommand {
    constructor(public readonly exception: boolean) {}
}

export class DemoHandler implements ICommandHandler {
    public received: boolean = false;

    @autowiring
    public async handle(command: DemoCommand): Promise<void|IAppError> {
        this.received = true;
        if (command.exception) {

            throw { code: 1, message: "Fail" } as IAppError;
        }
    }
}

export class DemoQuery implements IQuery {
    constructor(public readonly exception: boolean = false) {}
}

export class DemoQueryHandler implements IQueryHandler {
    @autowiring
    public async handle(request: DemoQuery): Promise<IAppResponse|IAppError> {
        if (request.exception) {
            throw { code: 0, message: "Fail" } as IAppError;
        }

        return { data: "Hello!" } as IAppResponse;
    }
}
