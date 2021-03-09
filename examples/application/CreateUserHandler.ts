import EventStore from '../../src/EventStore/EventStore';
import User from '../domain/User';
import CreateUser from './CreateUser';
import { inject, injectable } from 'inversify';
import autowiring from "../../src/Application/Bus/autowiring";
import type ICommandHandler from "../../src/Application/Bus/Command/CommandHandler";
import type {IAppError} from "../../src/Application/Bus/CallbackArg";

@injectable()
export default class CreateUserHandler implements ICommandHandler {

    constructor(
        @inject("user.eventStore") private readonly eventStore: EventStore<User>
    ) {}

    @autowiring
    async handle(command: CreateUser): Promise<void|IAppError> {
        const user = User.create(command.uuid, command.email);

        await this.eventStore.save(user);
    }
}
