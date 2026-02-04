/**
 * Base class for Value Objects in Domain-Driven Design.
 *
 * Value Objects are immutable objects that represent descriptive aspects of the domain
 * with no conceptual identity. They are defined by their attributes rather than a unique ID.
 *
 * Key characteristics:
 * - Immutable: Once created, they cannot be changed
 * - Equality by value: Two value objects are equal if all their attributes are equal
 * - Self-validating: They validate their own invariants upon construction
 *
 * @example
 * ```typescript
 * class EmailAddress extends ValueObject<{ value: string }> {
 *     private constructor(public readonly value: string) {
 *         super();
 *         this.validate();
 *     }
 *
 *     public static create(email: string): EmailAddress {
 *         return new EmailAddress(email);
 *     }
 *
 *     protected validate(): void {
 *         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 *         if (!emailRegex.test(this.value)) {
 *             throw new Error(`Invalid email address: ${this.value}`);
 *         }
 *     }
 *
 *     protected* getEqualityComponents(): Iterable<any> {
 *         yield this.value;
 *     }
 * }
 *
 * const email1 = EmailAddress.create("user@example.com");
 * const email2 = EmailAddress.create("user@example.com");
 * console.log(email1.equals(email2)); // true
 * ```
 */
export default abstract class ValueObject<T> {
    /**
     * Validates the value object's invariants.
     * This method is called automatically during construction.
     * Throw an error if validation fails.
     *
     * @throws {Error} When validation fails
     */
    protected abstract validate(): void;

    /**
     * Returns the components that determine equality.
     * Override this method to specify which properties should be compared.
     *
     * @returns An iterable of values to compare for equality
     */
    protected abstract getEqualityComponents(): Iterable<unknown>;

    /**
     * Checks if this value object is equal to another.
     * Two value objects are equal if all their equality components are equal.
     *
     * @param other - The other value object to compare with
     * @returns True if the value objects are equal, false otherwise
     */
    public equals(other: ValueObject<T> | null | undefined): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        if (this.constructor !== other.constructor) {
            return false;
        }

        return this.componentsAreEqual(
            Array.from(this.getEqualityComponents()),
            Array.from(other.getEqualityComponents())
        );
    }

    /**
     * Deep equality comparison for components.
     *
     * @param components1 - First array of components
     * @param components2 - Second array of components
     * @returns True if all components are deeply equal
     */
    private componentsAreEqual(components1: unknown[], components2: unknown[]): boolean {
        if (components1.length !== components2.length) {
            return false;
        }

        for (let i = 0; i < components1.length; i++) {
            if (!this.isEqual(components1[i], components2[i])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Deep equality check for individual values.
     * Handles primitives, arrays, objects, and nested value objects.
     *
     * @param value1 - First value to compare
     * @param value2 - Second value to compare
     * @returns True if values are deeply equal
     */
    private isEqual(value1: unknown, value2: unknown): boolean {
        // Strict equality for primitives and references
        if (value1 === value2) {
            return true;
        }

        // Handle null/undefined
        if (value1 === null || value1 === undefined || value2 === null || value2 === undefined) {
            return value1 === value2;
        }

        // Handle ValueObject instances
        if (value1 instanceof ValueObject && value2 instanceof ValueObject) {
            return value1.equals(value2);
        }

        // Handle Date objects
        if (value1 instanceof Date && value2 instanceof Date) {
            return value1.getTime() === value2.getTime();
        }

        // Handle arrays
        if (Array.isArray(value1) && Array.isArray(value2)) {
            if (value1.length !== value2.length) {
                return false;
            }
            for (let i = 0; i < value1.length; i++) {
                if (!this.isEqual(value1[i], value2[i])) {
                    return false;
                }
            }
            return true;
        }

        // Handle plain objects
        if (this.isPlainObject(value1) && this.isPlainObject(value2)) {
            const keys1 = Object.keys(value1);
            const keys2 = Object.keys(value2);

            if (keys1.length !== keys2.length) {
                return false;
            }

            for (const key of keys1) {
                if (!keys2.includes(key)) {
                    return false;
                }
                if (!this.isEqual(value1[key], value2[key])) {
                    return false;
                }
            }
            return true;
        }

        // Different types or values
        return false;
    }

    /**
     * Checks if a value is a plain object (not an array, Date, or class instance).
     *
     * @param value - The value to check
     * @returns True if the value is a plain object
     */
    private isPlainObject(value: unknown): value is Record<string, unknown> {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const proto = Object.getPrototypeOf(value);
        return proto === Object.prototype || proto === null;
    }
}
