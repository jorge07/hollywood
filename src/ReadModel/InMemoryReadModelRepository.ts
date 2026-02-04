/**
 * Generic in-memory repository for read models.
 * Useful for testing and simple applications.
 *
 * @typeParam T - The type of the read model stored in the repository
 *
 * @example
 * ```typescript
 * interface CustomerReadModel {
 *     id: string;
 *     name: string;
 *     email: string;
 * }
 *
 * const repository = new InMemoryReadModelRepository<CustomerReadModel>();
 * repository.save('customer-1', { id: 'customer-1', name: 'John', email: 'john@example.com' });
 * const customer = repository.oneOrFail('customer-1');
 * ```
 */
export default class InMemoryReadModelRepository<T> {
    private collection: Record<string, T> = {};

    /**
     * Saves a read model to the repository.
     *
     * @param id - The unique identifier for the read model
     * @param data - The read model data to store
     */
    public save(id: string, data: T): void {
        this.collection[id] = data;
    }

    /**
     * Retrieves a read model by ID or throws an error if not found.
     *
     * @param id - The unique identifier for the read model
     * @returns The read model data
     * @throws {Error} When the read model is not found
     */
    public oneOrFail(id: string): T {
        const data = this.collection[id];

        if (!data) {
            throw new Error("Not Found");
        }

        return data;
    }

    /**
     * Finds read models using a criteria function.
     * The criteria function receives the entire collection and can filter/transform as needed.
     *
     * @param criteria - Function that receives the collection and returns filtered results
     * @returns The result of applying the criteria function
     *
     * @example
     * ```typescript
     * // Find all customers with email containing 'example.com'
     * const results = repository.find((collection) =>
     *     Object.values(collection).filter(c => c.email.includes('example.com'))
     * );
     * ```
     */
    public find<TResult>(criteria: (collection: Record<string, T>) => TResult): TResult {
        return criteria(this.collection);
    }
}
