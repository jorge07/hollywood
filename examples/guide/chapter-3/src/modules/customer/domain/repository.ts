import type { Customer } from "./customer";

export interface CustomerRepository {
    getOneOfFail(userId: string): Promise<Customer>;
    save(customer: Customer): Promise<void>
}
