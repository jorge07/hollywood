import { Domain } from "../..";
import { UserWasCreated } from './UserWasCreated';

export default class User extends Domain.EventSourced {
    private uuid: string = "";
    private email: string = "";

    public static create(uuid: string, email: string): User {
        const instance = new User(uuid);

        instance.raise(new UserWasCreated(uuid, email));

        return instance;
    }

    public getAggregateRootId(): string {
        return this.uuid;
    }

    protected applyUserWasCreated(event: UserWasCreated): void {
        this.uuid = event.uuid;
        this.email = event.email;
    }

    get mail(): string {
        return this.email;
    }
}
