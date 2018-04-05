import ICommandHandler from "./Command/CommandHandler";
import IQueryHandler from "./Query/QueryHandler";

export interface ICommandRegistry {
    [key: string]: ICommandHandler;
}

export interface IQueryRegistry {
    [key: string]: IQueryHandler;
}
