import EventSourcedAggregateRoot from "../../src/Domain/EventSourcedAggregateRoot";
import EventSourced from "../../src/Domain/EventSourced";
import type DomainEvent from "../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../src/Domain/Event/DomainEventStream";
import { Identity } from "../../src/Domain/AggregateRoot";

// Test events
class ItemAdded implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly itemId: string,
        public readonly name: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class ItemRemoved implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly itemId: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

class UnhandledEvent implements DomainEvent {
    constructor(
        public readonly aggregateId: string,
        public readonly data: string,
        public readonly occurredAt: Date = new Date()
    ) {}
}

// Aggregate using explicit handler registration (new pattern)
class ShoppingCart extends EventSourcedAggregateRoot {
    public items: string[] = [];
    private readonly itemTracker: ItemTracker;

    constructor(id: Identity) {
        super(id);
        this.registerChildren(this.itemTracker = new ItemTracker());

        // Register handlers explicitly
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
        this.registerHandler(ItemRemoved, (event) => this.onItemRemoved(event));
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(this.getAggregateRootId().toString(), itemId, name));
    }

    public removeItem(itemId: string): void {
        this.raise(new ItemRemoved(this.getAggregateRootId().toString(), itemId));
    }

    public raiseUnhandledEvent(): void {
        this.raise(new UnhandledEvent(this.getAggregateRootId().toString(), "test"));
    }

    public getTrackedItems(): string[] {
        return this.itemTracker.trackedItems;
    }

    private onItemAdded(event: ItemAdded): void {
        this.items.push(event.name);
    }

    private onItemRemoved(event: ItemRemoved): void {
        this.items = this.items.filter((_, index) => index !== this.items.length - 1);
    }
}

// Child entity using explicit handler registration
class ItemTracker extends EventSourced {
    public trackedItems: string[] = [];

    constructor() {
        super();
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
        this.registerHandler(ItemRemoved, (event) => this.onItemRemoved(event));
    }

    private onItemAdded(event: ItemAdded): void {
        this.trackedItems.push(`Tracked: ${event.name}`);
    }

    private onItemRemoved(_event: ItemRemoved): void {
        // Intentionally empty - just needs to be handled
    }
}


describe("EventSourcedAggregateRoot", () => {

    describe("Handler registration pattern", () => {
        it("should handle events using registered handlers", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            expect(cart.items).toEqual(["Apple", "Banana"]);
        });

        it("should propagate events to child entities with registered handlers", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            expect(cart.getTrackedItems()).toEqual(["Tracked: Apple", "Tracked: Banana"]);
        });

        it("should handle remove events", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");
            cart.removeItem("item-2");

            expect(cart.items).toEqual(["Apple"]);
        });

        it("should throw error when no handler is registered for an event", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

            expect(() => {
                cart.raiseUnhandledEvent();
            }).toThrow("No handler registered for UnhandledEvent");
        });

        it("should store uncommitted events", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            const stream = cart.getUncommittedEvents();
            expect(stream.events.length).toBe(2);
            expect(stream.events[0].eventType).toBe("ItemAdded");
            expect(stream.events[1].eventType).toBe("ItemAdded");
        });

        it("should reconstruct from event history", () => {
            const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));
            const events = [
                DomainMessage.create("cart-1", 0, new ItemAdded("cart-1", "item-1", "Apple")),
                DomainMessage.create("cart-1", 1, new ItemAdded("cart-1", "item-2", "Banana")),
            ];
            const stream = new DomainEventStream(events);

            cart.fromHistory(stream);

            expect(cart.items).toEqual(["Apple", "Banana"]);
            expect(cart.getTrackedItems()).toEqual(["Tracked: Apple", "Tracked: Banana"]);
            expect(cart.version()).toBe(1);
        });
    });
});

// Aggregate with partial handler child for testing error case
class CartWithPartialTracker extends EventSourcedAggregateRoot {
    public items: string[] = [];
    private readonly tracker: PartialTracker;

    constructor(id: Identity) {
        super(id);
        this.registerChildren(this.tracker = new PartialTracker());
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
        this.registerHandler(ItemRemoved, (event) => this.onItemRemoved(event));
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(this.getAggregateRootId().toString(), itemId, name));
    }

    public removeItem(itemId: string): void {
        this.raise(new ItemRemoved(this.getAggregateRootId().toString(), itemId));
    }

    private onItemAdded(event: ItemAdded): void {
        this.items.push(event.name);
    }

    private onItemRemoved(_event: ItemRemoved): void {
        this.items.pop();
    }
}

// Child that only handles ItemAdded (not ItemRemoved) - to test error case
class PartialTracker extends EventSourced {
    public trackedItems: string[] = [];

    constructor() {
        super();
        // Only register handler for ItemAdded, not ItemRemoved
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
    }

    private onItemAdded(event: ItemAdded): void {
        this.trackedItems.push(`Tracked: ${event.name}`);
    }
}

describe("EventSourced child entities with explicit handler registration", () => {
    it("should use registered handlers in child entities", () => {
        const cart = new ShoppingCart(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

        cart.addItem("item-1", "Apple");

        expect(cart.getTrackedItems()).toEqual(["Tracked: Apple"]);
    });

    it("should throw when child has handlers but event has no handler", () => {
        // PartialTracker only registers handler for ItemAdded
        // When ItemRemoved is raised, it should throw
        const cart = new CartWithPartialTracker(Identity.fromString('00000000-0000-4000-8000-0000000000c1'));

        cart.addItem("item-1", "Apple");

        // ItemRemoved will propagate to PartialTracker which has handlers registered
        // but no handler for ItemRemoved, so it should throw
        expect(() => {
            cart.removeItem("item-1");
        }).toThrow("No handler registered for ItemRemoved");
    });
});
