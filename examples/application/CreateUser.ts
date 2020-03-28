import { ICommand } from "../../src/Application";

export default class CreateUser implements ICommand {
    constructor(
        public readonly uuid: string,
        public readonly email: string,
    ) {}
}
