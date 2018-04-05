import { ICommand, ICommandHandler, IQuery, IQueryHandler, AppResponse, AppError} from "../../../src/Application/";

export class DemoCommand implements ICommand {
    constructor(public readonly exception: boolean) {}
}

export class DemoHandler implements ICommandHandler {
    public received: boolean = false

    async handle(command: DemoCommand): Promise<void|AppError> {
        this.received = true;
        if (command.exception) {

            throw <AppError>{
                message: 'Fail',
                code: 1
            }
        }        
    }
}

export class DemoQuery implements IQuery {
    constructor(public readonly exception: boolean = false) {
    }
}

export class DemoQueryHandler implements IQueryHandler {
    async handle(request: DemoQuery): Promise<AppResponse|AppError> {
        if (request.exception) {

            throw <AppError>{
                message: 'Fail', 
                code: 0
            }
        }

        return <AppResponse>{
            data: 'Hello!'
        };
    }
}
