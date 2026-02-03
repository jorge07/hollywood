import Identity from "../../src/Domain/Identity";

describe("Identity", () => {
    describe("Creation", () => {
        it("should_generate_valid_uuid", () => {
            const id = Identity.generate();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            expect(uuidRegex.test(id.toString())).toBe(true);
        });

        it("should_generate_unique_identities", () => {
            const id1 = Identity.generate();
            const id2 = Identity.generate();

            expect(id1.equals(id2)).toBe(false);
            expect(id1.toString()).not.toBe(id2.toString());
        });

        it("should_create_from_valid_uuid_string", () => {
            const uuidString = "550e8400-e29b-41d4-a716-446655440000";
            const id = Identity.fromString(uuidString);

            expect(id.toString()).toBe(uuidString);
        });

        it("should_create_from_uppercase_uuid", () => {
            const uuidString = "550E8400-E29B-41D4-A716-446655440000";
            const id = Identity.fromString(uuidString);

            expect(id.toString()).toBe(uuidString);
        });

        it("should_reject_invalid_uuid_format", () => {
            expect(() => Identity.fromString("invalid-uuid")).toThrow(
                'Invalid UUID format: "invalid-uuid"'
            );
        });

        it("should_reject_uuid_with_wrong_length", () => {
            expect(() => Identity.fromString("550e8400-e29b-41d4-a716")).toThrow(
                "Invalid UUID format"
            );
        });

        it("should_reject_uuid_with_invalid_characters", () => {
            expect(() => Identity.fromString("550e8400-e29b-41d4-a716-44665544000g")).toThrow(
                "Invalid UUID format"
            );
        });

        it("should_reject_empty_string", () => {
            expect(() => Identity.fromString("")).toThrow(
                "Invalid UUID format"
            );
        });

        it("should_reject_uuid_without_hyphens", () => {
            expect(() => Identity.fromString("550e8400e29b41d4a716446655440000")).toThrow(
                "Invalid UUID format"
            );
        });
    });

    describe("Equality", () => {
        it("should_equal_identity_with_same_uuid", () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            const id1 = Identity.fromString(uuid);
            const id2 = Identity.fromString(uuid);

            expect(id1.equals(id2)).toBe(true);
        });

        it("should_not_equal_identity_with_different_uuid", () => {
            const id1 = Identity.fromString("550e8400-e29b-41d4-a716-446655440000");
            const id2 = Identity.fromString("660e8400-e29b-41d4-a716-446655440000");

            expect(id1.equals(id2)).toBe(false);
        });

        it("should_be_case_insensitive_for_equality", () => {
            const id1 = Identity.fromString("550e8400-e29b-41d4-a716-446655440000");
            const id2 = Identity.fromString("550E8400-E29B-41D4-A716-446655440000");

            expect(id1.equals(id2)).toBe(true);
        });

        it("should_not_equal_null", () => {
            const id = Identity.generate();

            expect(id.equals(null)).toBe(false);
        });

        it("should_not_equal_undefined", () => {
            const id = Identity.generate();

            expect(id.equals(undefined)).toBe(false);
        });
    });

    describe("String conversion", () => {
        it("should_convert_to_string_via_toString", () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            const id = Identity.fromString(uuid);

            expect(id.toString()).toBe(uuid);
        });

        it("should_convert_to_string_via_getValue", () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            const id = Identity.fromString(uuid);

            expect(id.getValue()).toBe(uuid);
        });

        it("should_preserve_case_in_string_conversion", () => {
            const uuid = "550E8400-e29b-41D4-A716-446655440000";
            const id = Identity.fromString(uuid);

            expect(id.toString()).toBe(uuid);
        });
    });

    describe("UUID version validation", () => {
        it("should_accept_uuid_v1", () => {
            const uuidV1 = "550e8400-e29b-11d4-a716-446655440000";
            expect(() => Identity.fromString(uuidV1)).not.toThrow();
        });

        it("should_accept_uuid_v4", () => {
            const uuidV4 = "550e8400-e29b-41d4-a716-446655440000";
            expect(() => Identity.fromString(uuidV4)).not.toThrow();
        });

        it("should_accept_uuid_v5", () => {
            const uuidV5 = "550e8400-e29b-51d4-a716-446655440000";
            expect(() => Identity.fromString(uuidV5)).not.toThrow();
        });

        it("should_reject_uuid_v0", () => {
            const uuidV0 = "550e8400-e29b-01d4-a716-446655440000";
            expect(() => Identity.fromString(uuidV0)).toThrow("Invalid UUID format");
        });

        it("should_reject_uuid_v6", () => {
            const uuidV6 = "550e8400-e29b-61d4-a716-446655440000";
            expect(() => Identity.fromString(uuidV6)).toThrow("Invalid UUID format");
        });
    });

    describe("Variant validation", () => {
        it("should_accept_valid_variant_bits_8", () => {
            const uuid = "550e8400-e29b-41d4-8716-446655440000";
            expect(() => Identity.fromString(uuid)).not.toThrow();
        });

        it("should_accept_valid_variant_bits_9", () => {
            const uuid = "550e8400-e29b-41d4-9716-446655440000";
            expect(() => Identity.fromString(uuid)).not.toThrow();
        });

        it("should_accept_valid_variant_bits_a", () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            expect(() => Identity.fromString(uuid)).not.toThrow();
        });

        it("should_accept_valid_variant_bits_b", () => {
            const uuid = "550e8400-e29b-41d4-b716-446655440000";
            expect(() => Identity.fromString(uuid)).not.toThrow();
        });
    });

    describe("Immutability", () => {
        it("should_enforce_immutability_via_typescript_readonly", () => {
            const id = Identity.generate();
            const originalValue = id.toString();

            // TypeScript enforces immutability at compile time through readonly modifiers
            // and private constructor. Attempting to modify would fail TypeScript compilation:
            // id.value = "new-value"; // Error: Property 'value' is private
            // new Identity("some-uuid"); // Error: Constructor is private

            // The value remains consistent
            expect(id.toString()).toBe(originalValue);
            expect(id.getValue()).toBe(originalValue);
        });
    });

    describe("Usage with aggregates", () => {
        it("should_work_as_aggregate_id", () => {
            const id = Identity.generate();

            // Simulate using it as an aggregate ID
            class TestAggregate {
                constructor(private readonly id: Identity) {}
                getId(): string {
                    return this.id.toString();
                }
            }

            const aggregate = new TestAggregate(id);
            expect(aggregate.getId()).toBe(id.toString());
        });

        it("should_enable_aggregate_comparison", () => {
            const id1 = Identity.generate();
            const id2 = Identity.generate();
            const id1Copy = Identity.fromString(id1.toString());

            // Same ID should be equal
            expect(id1.equals(id1Copy)).toBe(true);

            // Different IDs should not be equal
            expect(id1.equals(id2)).toBe(false);
        });
    });
});
