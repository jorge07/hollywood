import type { Application } from "hollywood-js";
import { Username } from "../../../domain/value-object/username";

export default class CreateCommand implements Application.ICommand {
    public readonly username: Username;
    constructor(
        public readonly uuid: string,
        username: string,
    ) {
        this.username = Username.fromLiteral(username);
    }
}
