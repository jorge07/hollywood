import type ICommand from "../../src/Application/Bus/Command/Command";

export default class CreateUser implements ICommand {
    constructor(
        public readonly uuid: string,
        public readonly email: string,
    ) {}
}
