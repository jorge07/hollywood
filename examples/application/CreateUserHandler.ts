import EventStore from '../../src/EventStore/EventStore';
import User from '../domain/User';
import CreateUser from './CreateUser';
import { autowiring } from '../../src/Application';
import { injectable, inject } from 'inversify';

@injectable()
export default class CreateUserHandler {

    constructor(
        @inject("user.eventStore") private readonly eventStore: EventStore<User>
    ) {}

    @autowiring
    async handle(command: CreateUser): Promise<void> {
        const user = User.create(command.uuid, command.email);

        await this.eventStore.save(user);
    }
}
