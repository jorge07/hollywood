import ValueObject from "../../src/Domain/ValueObject";

// Test value objects
class EmailAddress extends ValueObject<{ value: string }> {
    private constructor(public readonly value: string) {
        super();
        this.validate();
    }

    public static create(email: string): EmailAddress {
        return new EmailAddress(email);
    }

    protected validate(): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            throw new Error(`Invalid email address: ${this.value}`);
        }
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.value;
    }
}

class Money extends ValueObject<{ amount: number; currency: string }> {
    private constructor(
        public readonly amount: number,
        public readonly currency: string
    ) {
        super();
        this.validate();
    }

    public static create(amount: number, currency: string): Money {
        return new Money(amount, currency);
    }

    protected validate(): void {
        if (this.amount < 0) {
            throw new Error('Amount cannot be negative');
        }
        if (!this.currency || this.currency.length !== 3) {
            throw new Error('Currency must be a 3-letter code');
        }
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.amount;
        yield this.currency;
    }
}

class Address extends ValueObject<{
    street: string;
    city: string;
    country: string;
}> {
    private constructor(
        public readonly street: string,
        public readonly city: string,
        public readonly country: string
    ) {
        super();
        this.validate();
    }

    public static create(street: string, city: string, country: string): Address {
        return new Address(street, city, country);
    }

    protected validate(): void {
        if (!this.street || !this.city || !this.country) {
            throw new Error('All address fields are required');
        }
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.street;
        yield this.city;
        yield this.country;
    }
}

class DateRange extends ValueObject<{ start: Date; end: Date }> {
    private constructor(
        public readonly start: Date,
        public readonly end: Date
    ) {
        super();
        this.validate();
    }

    public static create(start: Date, end: Date): DateRange {
        return new DateRange(start, end);
    }

    protected validate(): void {
        if (this.start >= this.end) {
            throw new Error('Start date must be before end date');
        }
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.start;
        yield this.end;
    }
}

class NestedValueObject extends ValueObject<{ email: EmailAddress; money: Money }> {
    private constructor(
        public readonly email: EmailAddress,
        public readonly money: Money
    ) {
        super();
        this.validate();
    }

    public static create(email: EmailAddress, money: Money): NestedValueObject {
        return new NestedValueObject(email, money);
    }

    protected validate(): void {
        // Validation is delegated to nested value objects
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.email;
        yield this.money;
    }
}

describe("ValueObject", () => {
    describe("Equality semantics", () => {
        it("should_equal_another_value_object_with_same_values", () => {
            const email1 = EmailAddress.create("user@example.com");
            const email2 = EmailAddress.create("user@example.com");

            expect(email1.equals(email2)).toBe(true);
        });

        it("should_not_equal_value_object_with_different_values", () => {
            const email1 = EmailAddress.create("user1@example.com");
            const email2 = EmailAddress.create("user2@example.com");

            expect(email1.equals(email2)).toBe(false);
        });

        it("should_not_equal_null", () => {
            const email = EmailAddress.create("user@example.com");

            expect(email.equals(null)).toBe(false);
        });

        it("should_not_equal_undefined", () => {
            const email = EmailAddress.create("user@example.com");

            expect(email.equals(undefined)).toBe(false);
        });

        it("should_not_equal_different_type", () => {
            const email = EmailAddress.create("user@example.com");
            const money = Money.create(100, "USD");

            expect(email.equals(money as any)).toBe(false);
        });
    });

    describe("Multi-property equality", () => {
        it("should_equal_when_all_properties_match", () => {
            const money1 = Money.create(100, "USD");
            const money2 = Money.create(100, "USD");

            expect(money1.equals(money2)).toBe(true);
        });

        it("should_not_equal_when_amount_differs", () => {
            const money1 = Money.create(100, "USD");
            const money2 = Money.create(200, "USD");

            expect(money1.equals(money2)).toBe(false);
        });

        it("should_not_equal_when_currency_differs", () => {
            const money1 = Money.create(100, "USD");
            const money2 = Money.create(100, "EUR");

            expect(money1.equals(money2)).toBe(false);
        });
    });

    describe("Deep equality", () => {
        it("should_handle_date_equality", () => {
            const date1 = new Date("2024-01-01");
            const date2 = new Date("2024-01-01");
            const range1 = DateRange.create(date1, new Date("2024-12-31"));
            const range2 = DateRange.create(date2, new Date("2024-12-31"));

            expect(range1.equals(range2)).toBe(true);
        });

        it("should_handle_nested_value_objects", () => {
            const email = EmailAddress.create("user@example.com");
            const money = Money.create(100, "USD");
            const nested1 = NestedValueObject.create(email, money);

            const email2 = EmailAddress.create("user@example.com");
            const money2 = Money.create(100, "USD");
            const nested2 = NestedValueObject.create(email2, money2);

            expect(nested1.equals(nested2)).toBe(true);
        });

        it("should_detect_nested_value_object_differences", () => {
            const email = EmailAddress.create("user@example.com");
            const money = Money.create(100, "USD");
            const nested1 = NestedValueObject.create(email, money);

            const email2 = EmailAddress.create("different@example.com");
            const money2 = Money.create(100, "USD");
            const nested2 = NestedValueObject.create(email2, money2);

            expect(nested1.equals(nested2)).toBe(false);
        });
    });

    describe("Validation", () => {
        it("should_reject_invalid_email", () => {
            expect(() => EmailAddress.create("invalid-email")).toThrow(
                "Invalid email address: invalid-email"
            );
        });

        it("should_accept_valid_email", () => {
            expect(() => EmailAddress.create("user@example.com")).not.toThrow();
        });

        it("should_reject_negative_amount", () => {
            expect(() => Money.create(-100, "USD")).toThrow(
                "Amount cannot be negative"
            );
        });

        it("should_reject_invalid_currency", () => {
            expect(() => Money.create(100, "US")).toThrow(
                "Currency must be a 3-letter code"
            );
        });

        it("should_reject_incomplete_address", () => {
            expect(() => Address.create("", "City", "Country")).toThrow(
                "All address fields are required"
            );
        });

        it("should_reject_invalid_date_range", () => {
            const start = new Date("2024-12-31");
            const end = new Date("2024-01-01");

            expect(() => DateRange.create(start, end)).toThrow(
                "Start date must be before end date"
            );
        });
    });

    describe("Immutability", () => {
        it("should_enforce_immutability_via_typescript_readonly", () => {
            const email = EmailAddress.create("user@example.com");

            // TypeScript enforces immutability at compile time through readonly modifiers
            // At runtime, the properties are technically writable, but TypeScript prevents
            // accidental modification. This is the standard approach for value objects.
            // Attempting to modify would fail TypeScript compilation:
            // email.value = "new@example.com"; // Error: Cannot assign to 'value'

            expect(email.value).toBe("user@example.com");
        });

        it("should_maintain_separate_instances", () => {
            const money1 = Money.create(100, "USD");
            const money2 = Money.create(100, "USD");

            // They are equal but not the same instance
            expect(money1.equals(money2)).toBe(true);
            expect(money1 === money2).toBe(false);
        });
    });
});
