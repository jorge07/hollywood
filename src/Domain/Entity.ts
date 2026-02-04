/**
 * Base class for Entities in Domain-Driven Design.
 *
 * Entities are domain objects that have a conceptual identity that persists
 * over time, independent of their attribute values. Two entities with the same
 * identity are considered the same entity, even if their attributes differ.
 *
 * Key characteristics:
 * - Identity-based equality: Entities are equal if they have the same identity
 * - Mutable attributes: Unlike value objects, entity attributes can change over time
 * - Lifecycle: Entities have a lifecycle that matters to the business
 *
 * @typeParam TId - The type of the entity's identifier (typically Identity or a custom ID type)
 *
 * @remarks
 * This class differs from EventSourcedAggregateRoot in important ways:
 *
 * **Entity** (this class):
 * - Represents any domain object with identity
 * - Can be used for child entities within aggregates
 * - Identity-based equality semantics
 * - No event sourcing behavior built-in
 * - Lightweight, focused on identity
 *
 * **EventSourcedAggregateRoot**:
 * - Specifically for aggregate roots that use event sourcing
 * - Manages domain events and state reconstruction
 * - Includes playhead, event handlers, snapshots
 * - Heavier, includes event sourcing infrastructure
 *
 * Use Entity when you need identity semantics without event sourcing.
 * Use EventSourcedAggregateRoot for aggregate roots that manage their state via events.
 *
 * @example
 * ```typescript
 * // Using with the built-in Identity value object
 * class Customer extends Entity<Identity> {
 *     constructor(
 *         id: Identity,
 *         private name: string,
 *         private email: string
 *     ) {
 *         super(id);
 *     }
 *
 *     public changeName(newName: string): void {
 *         this.name = newName;
 *     }
 *
 *     public getName(): string {
 *         return this.name;
 *     }
 * }
 *
 * const id1 = Identity.generate();
 * const customer1 = new Customer(id1, "Alice", "alice@example.com");
 * const customer2 = new Customer(id1, "Bob", "bob@example.com");
 *
 * // Same identity = same entity, despite different attributes
 * console.log(customer1.equals(customer2)); // true
 * ```
 *
 * @example
 * ```typescript
 * // Using with a custom ID type
 * class OrderNumber extends ValueObject<{ value: string }> {
 *     private constructor(private readonly value: string) {
 *         super();
 *         this.validate();
 *     }
 *
 *     public static create(value: string): OrderNumber {
 *         return new OrderNumber(value);
 *     }
 *
 *     protected validate(): void {
 *         if (!/^ORD-\d{6}$/.test(this.value)) {
 *             throw new Error(`Invalid order number: ${this.value}`);
 *         }
 *     }
 *
 *     protected* getEqualityComponents(): Iterable<any> {
 *         yield this.value;
 *     }
 *
 *     public toString(): string {
 *         return this.value;
 *     }
 * }
 *
 * class Order extends Entity<OrderNumber> {
 *     constructor(
 *         id: OrderNumber,
 *         private total: number
 *     ) {
 *         super(id);
 *     }
 * }
 *
 * const orderNum = OrderNumber.create("ORD-123456");
 * const order = new Order(orderNum, 99.99);
 * ```
 */
export default abstract class Entity<TId> {
    /**
     * Creates a new entity with the given identity.
     *
     * @param id - The unique identifier for this entity
     */
    constructor(private readonly id: TId) {}

    /**
     * Returns the entity's identity.
     *
     * @returns The unique identifier
     */
    public getId(): TId {
        return this.id;
    }

    /**
     * Checks if this entity is equal to another entity.
     * Two entities are equal if they have the same identity.
     *
     * Identity comparison handles:
     * - Value objects with equals() method (like Identity)
     * - Primitives (string, number) via strict equality
     * - Any type with custom equality semantics
     *
     * @param other - The other entity to compare with
     * @returns True if both entities have the same identity, false otherwise
     */
    public equals(other: Entity<TId> | null | undefined): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        // Same reference
        if (this === other) {
            return true;
        }

        // Different types
        if (this.constructor !== other.constructor) {
            return false;
        }

        // Compare identities
        return this.identitiesAreEqual(this.id, other.id);
    }

    /**
     * Compares two identity values for equality.
     * Handles both value objects and primitive types.
     *
     * @param id1 - First identity
     * @param id2 - Second identity
     * @returns True if identities are equal
     */
    private identitiesAreEqual(id1: TId, id2: TId): boolean {
        // Handle value objects with equals method
        if (this.hasEqualsMethod(id1) && this.hasEqualsMethod(id2)) {
            return id1.equals(id2);
        }

        // Handle primitives and other types
        return id1 === id2;
    }

    /**
     * Type guard to check if an object has an equals method.
     * Used to detect value objects.
     *
     * @param obj - The object to check
     * @returns True if object has an equals method
     */
    private hasEqualsMethod(obj: unknown): obj is { equals(other: unknown): boolean } {
        return obj !== null &&
               obj !== undefined &&
               typeof obj === 'object' &&
               typeof (obj as Record<string, unknown>).equals === 'function';
    }
}
