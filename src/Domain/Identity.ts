import ValueObject from "./ValueObject";
import * as crypto from "crypto";

/**
 * Represents a universally unique identifier for aggregates and entities.
 *
 * Identity is a Value Object that encapsulates aggregate root and entity identifiers.
 * It ensures that all IDs are valid UUIDs and provides type safety over plain strings.
 *
 * @example
 * ```typescript
 * // Create a new unique identity
 * const id1 = Identity.generate();
 *
 * // Create from an existing UUID string
 * const id2 = Identity.fromString("550e8400-e29b-41d4-a716-446655440000");
 *
 * // Use in aggregate
 * class Order extends EventSourcedAggregateRoot {
 *     constructor(id: Identity) {
 *         super(id.toString());
 *     }
 * }
 *
 * // Equality comparison
 * const id3 = Identity.fromString("550e8400-e29b-41d4-a716-446655440000");
 * console.log(id2.equals(id3)); // true
 * ```
 */
export default class Identity extends ValueObject<{ value: string }> {
    private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    private constructor(private readonly value: string) {
        super();
        this.validate();
    }

    /**
     * Generates a new unique identity using UUID v4.
     *
     * @returns A new Identity instance
     */
    public static generate(): Identity {
        // Use crypto.randomUUID if available (Node 14.17+), otherwise generate manually
        if (typeof (crypto as any).randomUUID === 'function') {
            return new Identity((crypto as any).randomUUID());
        }
        return new Identity(Identity.generateUUIDv4());
    }

    /**
     * Generates a UUID v4 compatible string using crypto.randomBytes.
     * Fallback for environments without crypto.randomUUID.
     *
     * @returns A UUID v4 string
     */
    private static generateUUIDv4(): string {
        const bytes = crypto.randomBytes(16);

        // Set version (4) and variant (10) bits
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        // Format as UUID string
        const hex = bytes.toString('hex');
        return [
            hex.substring(0, 8),
            hex.substring(8, 12),
            hex.substring(12, 16),
            hex.substring(16, 20),
            hex.substring(20, 32)
        ].join('-');
    }

    /**
     * Creates an Identity from an existing UUID string.
     *
     * @param uuid - A valid UUID string
     * @returns An Identity instance
     * @throws {Error} When the UUID format is invalid
     */
    public static fromString(uuid: string): Identity {
        return new Identity(uuid);
    }

    /**
     * Returns the UUID as a string.
     * This method is used for backward compatibility with code expecting strings.
     *
     * @returns The UUID string
     */
    public toString(): string {
        return this.value;
    }

    /**
     * Returns the UUID value.
     * Alias for toString() for clearer intent when extracting the raw value.
     *
     * @returns The UUID string
     */
    public getValue(): string {
        return this.value;
    }

    /**
     * Validates that the value is a properly formatted UUID.
     *
     * @throws {Error} When the UUID format is invalid
     */
    protected validate(): void {
        if (!Identity.UUID_REGEX.test(this.value)) {
            throw new Error(
                `Invalid UUID format: "${this.value}". ` +
                `Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
            );
        }
    }

    /**
     * Returns the components used for equality comparison.
     *
     * @returns An iterable containing the UUID value
     */
    protected* getEqualityComponents(): Iterable<any> {
        yield this.value.toLowerCase(); // UUIDs are case-insensitive
    }
}
