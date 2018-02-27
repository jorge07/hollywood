import {ICommand, ICommandHandler, IQuery, IQueryHandler} from "../../../src/Application/";

export class DemoCommand implements ICommand {
}

export class DemoHandler implements ICommandHandler {

    public received: boolean = false;

    public handle(demo: DemoCommand): void {
        this.received = true;
    }
}

export class DemoQuery implements IQuery {

}

export class DemoQueryHandler implements IQueryHandler {
    public handle(query: DemoQuery): Promise<string> {
        return new Promise(() => ("Hello!"));
    }
}
