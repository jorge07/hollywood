import Entity from "../../src/Domain/Entity";
import Identity from "../../src/Domain/Identity";
import ValueObject from "../../src/Domain/ValueObject";

// Test entity using built-in Identity
class Customer extends Entity<Identity> {
    constructor(
        id: Identity,
        private name: string,
        private email: string
    ) {
        super(id);
    }

    public changeName(newName: string): void {
        this.name = newName;
    }

    public getName(): string {
        return this.name;
    }

    public getEmail(): string {
        return this.email;
    }
}

// Test entity using primitive ID (string)
class Product extends Entity<string> {
    constructor(
        id: string,
        private name: string,
        private price: number
    ) {
        super(id);
    }

    public getPrice(): number {
        return this.price;
    }

    public updatePrice(newPrice: number): void {
        this.price = newPrice;
    }
}

// Test entity using primitive ID (number)
class Invoice extends Entity<number> {
    constructor(
        id: number,
        private amount: number
    ) {
        super(id);
    }

    public getAmount(): number {
        return this.amount;
    }
}

// Custom ID value object for testing
class OrderNumber extends ValueObject<{ value: string }> {
    private constructor(private readonly value: string) {
        super();
        this.validate();
    }

    public static create(value: string): OrderNumber {
        return new OrderNumber(value);
    }

    protected validate(): void {
        if (!/^ORD-\d{6}$/.test(this.value)) {
            throw new Error(`Invalid order number: ${this.value}`);
        }
    }

    protected* getEqualityComponents(): Iterable<any> {
        yield this.value;
    }

    public toString(): string {
        return this.value;
    }
}

class Order extends Entity<OrderNumber> {
    constructor(
        id: OrderNumber,
        private total: number
    ) {
        super(id);
    }

    public getTotal(): number {
        return this.total;
    }

    public addAmount(amount: number): void {
        this.total += amount;
    }
}

describe("Entity", () => {
    describe("Identity-based equality with Identity value object", () => {
        it("should_return_true_when_entities_have_same_identity", () => {
            const id = Identity.generate();
            const customer1 = new Customer(id, "Alice", "alice@example.com");
            const customer2 = new Customer(id, "Bob", "bob@example.com");

            expect(customer1.equals(customer2)).toBe(true);
        });

        it("should_return_false_when_entities_have_different_identities", () => {
            const id1 = Identity.generate();
            const id2 = Identity.generate();
            const customer1 = new Customer(id1, "Alice", "alice@example.com");
            const customer2 = new Customer(id2, "Alice", "alice@example.com");

            expect(customer1.equals(customer2)).toBe(false);
        });

        it("should_return_true_when_comparing_entity_with_itself", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");

            expect(customer.equals(customer)).toBe(true);
        });

        it("should_handle_identity_equality_case_insensitively", () => {
            const uuid = "550e8400-e29b-41d4-a716-446655440000";
            const id1 = Identity.fromString(uuid.toLowerCase());
            const id2 = Identity.fromString(uuid.toUpperCase());
            const customer1 = new Customer(id1, "Alice", "alice@example.com");
            const customer2 = new Customer(id2, "Bob", "bob@example.com");

            expect(customer1.equals(customer2)).toBe(true);
        });
    });

    describe("Identity-based equality with primitive string ID", () => {
        it("should_return_true_when_entities_have_same_string_id", () => {
            const product1 = new Product("SKU-123", "Widget", 9.99);
            const product2 = new Product("SKU-123", "Gadget", 19.99);

            expect(product1.equals(product2)).toBe(true);
        });

        it("should_return_false_when_entities_have_different_string_ids", () => {
            const product1 = new Product("SKU-123", "Widget", 9.99);
            const product2 = new Product("SKU-456", "Widget", 9.99);

            expect(product1.equals(product2)).toBe(false);
        });
    });

    describe("Identity-based equality with primitive number ID", () => {
        it("should_return_true_when_entities_have_same_numeric_id", () => {
            const invoice1 = new Invoice(12345, 100.00);
            const invoice2 = new Invoice(12345, 200.00);

            expect(invoice1.equals(invoice2)).toBe(true);
        });

        it("should_return_false_when_entities_have_different_numeric_ids", () => {
            const invoice1 = new Invoice(12345, 100.00);
            const invoice2 = new Invoice(67890, 100.00);

            expect(invoice1.equals(invoice2)).toBe(false);
        });
    });

    describe("Identity-based equality with custom ID value object", () => {
        it("should_return_true_when_entities_have_same_custom_id", () => {
            const orderNum = OrderNumber.create("ORD-123456");
            const order1 = new Order(orderNum, 99.99);
            const order2 = new Order(orderNum, 199.99);

            expect(order1.equals(order2)).toBe(true);
        });

        it("should_return_false_when_entities_have_different_custom_ids", () => {
            const orderNum1 = OrderNumber.create("ORD-123456");
            const orderNum2 = OrderNumber.create("ORD-789012");
            const order1 = new Order(orderNum1, 99.99);
            const order2 = new Order(orderNum2, 99.99);

            expect(order1.equals(order2)).toBe(false);
        });

        it("should_handle_custom_id_value_object_equality", () => {
            // Create two separate OrderNumber instances with same value
            const orderNum1 = OrderNumber.create("ORD-123456");
            const orderNum2 = OrderNumber.create("ORD-123456");
            const order1 = new Order(orderNum1, 99.99);
            const order2 = new Order(orderNum2, 99.99);

            expect(order1.equals(order2)).toBe(true);
        });
    });

    describe("Edge cases", () => {
        it("should_return_false_when_comparing_with_null", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");

            expect(customer.equals(null)).toBe(false);
        });

        it("should_return_false_when_comparing_with_undefined", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");

            expect(customer.equals(undefined)).toBe(false);
        });

        it("should_return_false_when_comparing_different_entity_types", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");
            const product = new Product(id.toString(), "Widget", 9.99);

            // TypeScript prevents this at compile time, but test runtime behavior
            expect(customer.equals(product as any)).toBe(false);
        });
    });

    describe("getId method", () => {
        it("should_return_identity_value_object", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");

            expect(customer.getId()).toBe(id);
            expect(customer.getId().equals(id)).toBe(true);
        });

        it("should_return_string_id", () => {
            const product = new Product("SKU-123", "Widget", 9.99);

            expect(product.getId()).toBe("SKU-123");
        });

        it("should_return_numeric_id", () => {
            const invoice = new Invoice(12345, 100.00);

            expect(invoice.getId()).toBe(12345);
        });

        it("should_return_custom_id_value_object", () => {
            const orderNum = OrderNumber.create("ORD-123456");
            const order = new Order(orderNum, 99.99);

            expect(order.getId()).toBe(orderNum);
            expect(order.getId().equals(orderNum)).toBe(true);
        });
    });

    describe("Mutable attributes behavior", () => {
        it("should_allow_attribute_changes_without_affecting_identity", () => {
            const id = Identity.generate();
            const customer = new Customer(id, "Alice", "alice@example.com");

            customer.changeName("Alice Smith");

            expect(customer.getName()).toBe("Alice Smith");
            expect(customer.getId().equals(id)).toBe(true);
        });

        it("should_maintain_equality_after_attribute_changes", () => {
            const id = Identity.generate();
            const customer1 = new Customer(id, "Alice", "alice@example.com");
            const customer2 = new Customer(id, "Bob", "bob@example.com");

            customer1.changeName("Alice Smith");
            customer2.changeName("Bob Jones");

            // Still equal because same identity
            expect(customer1.equals(customer2)).toBe(true);
        });
    });
});
