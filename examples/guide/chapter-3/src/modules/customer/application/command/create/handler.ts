import { Application } from "hollywood-js";
import type {IAppError} from "hollywood-js/src/Application/Bus/CallbackArg";
import {inject, injectable} from 'inversify';
import CreateCommand from "./command";
import {Customer} from "../../../domain/customer";
import {CustomerRepository} from "../../../domain/repository";

@injectable()
export default class CreateHandler implements Application.ICommandHandler {
    constructor(@inject("customer.repository") private readonly repository: CustomerRepository) {}

    @Application.autowiring
    public async handle(command: CreateCommand): Promise<void | IAppError> {
        const customer = new Customer(command.uuid, command.username);
        await this.repository.save(customer);
    }
}
