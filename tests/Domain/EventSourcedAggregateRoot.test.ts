import EventSourcedAggregateRoot from "../../src/Domain/EventSourcedAggregateRoot";
import EventSourced from "../../src/Domain/EventSourced";
import type DomainEvent from "../../src/Domain/Event/DomainEvent";
import DomainMessage from "../../src/Domain/Event/DomainMessage";
import DomainEventStream from "../../src/Domain/Event/DomainEventStream";

// Test events
class ItemAdded implements DomainEvent {
    constructor(public readonly itemId: string, public readonly name: string) {}
}

class ItemRemoved implements DomainEvent {
    constructor(public readonly itemId: string) {}
}

class UnhandledEvent implements DomainEvent {
    constructor(public readonly data: string) {}
}

// Aggregate using explicit handler registration (new pattern)
class ShoppingCart extends EventSourcedAggregateRoot {
    public items: string[] = [];
    private readonly itemTracker: ItemTracker;

    constructor(id: string) {
        super(id);
        this.registerChildren(this.itemTracker = new ItemTracker());

        // Register handlers explicitly
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
        this.registerHandler(ItemRemoved, (event) => this.onItemRemoved(event));
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(itemId, name));
    }

    public removeItem(itemId: string): void {
        this.raise(new ItemRemoved(itemId));
    }

    public raiseUnhandledEvent(): void {
        this.raise(new UnhandledEvent("test"));
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

// Aggregate using legacy apply* pattern (for backwards compatibility testing)
class LegacyCart extends EventSourcedAggregateRoot {
    public items: string[] = [];

    constructor(id: string) {
        super(id);
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(itemId, name));
    }

    // Legacy pattern - apply<EventName> method
    public applyItemAdded(event: ItemAdded): void {
        this.items.push(event.name);
    }
}

// Mixed aggregate using both patterns
class MixedCart extends EventSourcedAggregateRoot {
    public items: string[] = [];
    public removedCount: number = 0;

    constructor(id: string) {
        super(id);
        // Only register handler for ItemAdded
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(itemId, name));
    }

    public removeItem(itemId: string): void {
        this.raise(new ItemRemoved(itemId));
    }

    private onItemAdded(event: ItemAdded): void {
        this.items.push(event.name);
    }

    // Legacy pattern for ItemRemoved - should not be called when handlers are registered
    public applyItemRemoved(event: ItemRemoved): void {
        this.removedCount++;
    }
}

describe("EventSourcedAggregateRoot with explicit handler registration", () => {

    describe("New handler registration pattern", () => {
        it("should handle events using registered handlers", () => {
            const cart = new ShoppingCart("cart-1");

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            expect(cart.items).toEqual(["Apple", "Banana"]);
        });

        it("should propagate events to child entities with registered handlers", () => {
            const cart = new ShoppingCart("cart-1");

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            expect(cart.getTrackedItems()).toEqual(["Tracked: Apple", "Tracked: Banana"]);
        });

        it("should handle remove events", () => {
            const cart = new ShoppingCart("cart-1");

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");
            cart.removeItem("item-2");

            expect(cart.items).toEqual(["Apple"]);
        });

        it("should throw error when no handler is registered for an event", () => {
            const cart = new ShoppingCart("cart-1");

            expect(() => {
                cart.raiseUnhandledEvent();
            }).toThrow("No handler registered for UnhandledEvent");
        });

        it("should store uncommitted events", () => {
            const cart = new ShoppingCart("cart-1");

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            const stream = cart.getUncommittedEvents();
            expect(stream.events.length).toBe(2);
            expect(stream.events[0].eventType).toBe("ItemAdded");
            expect(stream.events[1].eventType).toBe("ItemAdded");
        });

        it("should reconstruct from event history", () => {
            const cart = new ShoppingCart("cart-1");
            const events = [
                DomainMessage.create("cart-1", 0, new ItemAdded("item-1", "Apple")),
                DomainMessage.create("cart-1", 1, new ItemAdded("item-2", "Banana")),
            ];
            const stream = new DomainEventStream(events);

            cart.fromHistory(stream);

            expect(cart.items).toEqual(["Apple", "Banana"]);
            expect(cart.getTrackedItems()).toEqual(["Tracked: Apple", "Tracked: Banana"]);
            expect(cart.version()).toBe(1);
        });
    });

    describe("Legacy apply* pattern backwards compatibility", () => {
        it("should still work with legacy apply* methods", () => {
            const cart = new LegacyCart("cart-1");

            cart.addItem("item-1", "Apple");
            cart.addItem("item-2", "Banana");

            expect(cart.items).toEqual(["Apple", "Banana"]);
        });

        it("should reconstruct from history with legacy pattern", () => {
            const cart = new LegacyCart("cart-1");
            const events = [
                DomainMessage.create("cart-1", 0, new ItemAdded("item-1", "Apple")),
                DomainMessage.create("cart-1", 1, new ItemAdded("item-2", "Banana")),
            ];
            const stream = new DomainEventStream(events);

            cart.fromHistory(stream);

            expect(cart.items).toEqual(["Apple", "Banana"]);
        });

        it("should silently ignore unhandled events in legacy mode", () => {
            // LegacyCart only handles ItemAdded, not ItemRemoved
            const cart = new LegacyCart("cart-1");
            const events = [
                DomainMessage.create("cart-1", 0, new ItemAdded("item-1", "Apple")),
                DomainMessage.create("cart-1", 1, new ItemRemoved("item-1")), // No handler for this
            ];
            const stream = new DomainEventStream(events);

            // Should not throw - legacy behavior is to silently ignore
            expect(() => {
                cart.fromHistory(stream);
            }).not.toThrow();

            expect(cart.items).toEqual(["Apple"]);
        });
    });

    describe("Mixed pattern behavior", () => {
        it("should throw when using handlers but event has no handler", () => {
            const cart = new MixedCart("cart-1");

            // ItemAdded has a registered handler, works fine
            cart.addItem("item-1", "Apple");
            expect(cart.items).toEqual(["Apple"]);

            // ItemRemoved has no registered handler, even though applyItemRemoved exists
            // Since we registered at least one handler, strict mode is enabled
            expect(() => {
                cart.removeItem("item-1");
            }).toThrow("No handler registered for ItemRemoved");
        });
    });
});

// Aggregate with partial handler child for testing error case
class CartWithPartialTracker extends EventSourcedAggregateRoot {
    public items: string[] = [];
    private readonly tracker: PartialTracker;

    constructor(id: string) {
        super(id);
        this.registerChildren(this.tracker = new PartialTracker());
        this.registerHandler(ItemAdded, (event) => this.onItemAdded(event));
        this.registerHandler(ItemRemoved, (event) => this.onItemRemoved(event));
    }

    public addItem(itemId: string, name: string): void {
        this.raise(new ItemAdded(itemId, name));
    }

    public removeItem(itemId: string): void {
        this.raise(new ItemRemoved(itemId));
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
        const cart = new ShoppingCart("cart-1");

        cart.addItem("item-1", "Apple");

        expect(cart.getTrackedItems()).toEqual(["Tracked: Apple"]);
    });

    it("should throw when child has handlers but event has no handler", () => {
        // PartialTracker only registers handler for ItemAdded
        // When ItemRemoved is raised, it should throw
        const cart = new CartWithPartialTracker("cart-1");

        cart.addItem("item-1", "Apple");

        // ItemRemoved will propagate to PartialTracker which has handlers registered
        // but no handler for ItemRemoved, so it should throw
        expect(() => {
            cart.removeItem("item-1");
        }).toThrow("No handler registered for ItemRemoved");
    });
});
