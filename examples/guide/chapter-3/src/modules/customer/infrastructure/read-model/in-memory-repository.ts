import { ReadModel } from "hollywood-js";
import type { CustomerRepository } from "../../domain/repository";
import type {Customer} from "../../domain/customer";

export class InMemoryRepository implements CustomerRepository {
    private readonly dbal: ReadModel.InMemoryReadModelRepository;

    constructor() {
        this.dbal = new ReadModel.InMemoryReadModelRepository();
    }

    async getOneOfFail(userId: string): Promise<Customer> {
        return await this.dbal.oneOrFail(userId);
    }

    async save(customer: Customer): Promise<void> {
        await this.dbal.save(customer.userId, customer);
    }
}
