import {CommandHandler} from "../../../src/Application/Bus/Command/CommandHandler";
import {Command} from "../../../src/Application/Bus/Command/Command";
import {Query} from "../../../src/Application/Bus/Query/Query";
import {QueryHandler} from "../../../src/Application/Bus/Query/QueryHandler";

export class DemoCommand implements Command {

}

export class DemoHandler implements CommandHandler {

    public received: boolean = false;

    handle(demo: DemoCommand): void {
        this.received = true
    }
}

export class DemoQuery implements Query {

}

export class DemoQueryHandler implements QueryHandler {
    handle(query: DemoQuery): string {
        return 'Hello!'
    }
}
