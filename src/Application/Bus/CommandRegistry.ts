import ICommandHandler from './Command/CommandHandler';
import IQueryHandler from './Query/QueryHandler';

export type CommandRegistry = {
    [key: string]: ICommandHandler;
}

export type QueryRegistry = {
    [key: string]: IQueryHandler;
}
