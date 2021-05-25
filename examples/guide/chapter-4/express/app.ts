import {Application, ReadModel} from "hollywood-js";
import {inject, injectable} from "inversify";

const UserRepositoryAlias = 'user.repository';

export class FindUser implements Application.IQuery {
    constructor(public readonly uuid: string) {}
}

@injectable()
export class FindUserHandler implements Application.IQueryHandler {
    constructor(@inject(UserRepositoryAlias) private readonly repository: ReadModel.InMemoryReadModelRepository) {
    }
    @Application.autowiring
    async handle(command: FindUser) {
        return await this.repository.oneOrFail(command.uuid);
    }
}

export class CreateUser implements Application.ICommand {
    constructor(
        public readonly uuid: string,
        public readonly username: string
    ) {
    }
}

@injectable()
export class CreateUserHandler implements Application.ICommandHandler {
    constructor(
        @inject(UserRepositoryAlias) private readonly repository: ReadModel.InMemoryReadModelRepository
    ) {
    }
    @Application.autowiring
    async handle(command: CreateUser) {
        return this.repository.save(command.uuid, User.fromPayload(command));
    }
}

class User {
    static fromPayload(payload: {
        uuid: string,
        username: string
    }) {
        return new User(payload.uuid, payload.username);
    }

    private constructor(
        public readonly uuid: string,
        public readonly username: string,
    ) {
    }
}
