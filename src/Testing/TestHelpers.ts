import EventStore from '../EventSourcing/EventStore';
import EventBus from '../EventSourcing/EventBus/EventBus';
import InMemoryEventStore from '../EventSourcing/InMemoryEventStore';
import InMemorySnapshotStoreDBAL from '../EventSourcing/Snapshot/InMemorySnapshotStoreDBAL';
import Repository from '../EventSourcing/Repository/Repository';
import EventSourcedAggregateRoot from '../Domain/EventSourcedAggregateRoot';
import Kernel from '../Framework/Kernel';
import type ModuleContext from '../Framework/Modules/ModuleContext';
import type { AggregateFactory } from '../EventSourcing/EventStore';

/**
 * Configuration options for test event store creation.
 */
export interface TestEventStoreOptions {
    /**
     * Enable snapshot support with in-memory snapshot store.
     * Default: false
     */
    withSnapshots?: boolean;

    /**
     * Number of events between snapshots.
     * Only applies when withSnapshots is true.
     * Default: 10
     */
    snapshotMargin?: number;
}

/**
 * Creates an in-memory EventStore for testing purposes.
 * Includes EventBus and optional snapshot support.
 *
 * @typeParam T - The event-sourced aggregate root type
 * @param aggregateFactory - Constructor for the aggregate root class
 * @param options - Optional configuration for snapshots
 * @returns A fully configured EventStore with in-memory infrastructure
 *
 * @example
 * ```typescript
 * const eventStore = createTestEventStore(Order);
 * const order = new Order('order-123');
 * order.create();
 * await eventStore.save(order);
 * ```
 *
 * @example
 * ```typescript
 * // With snapshot support
 * const eventStore = createTestEventStore(Order, {
 *   withSnapshots: true,
 *   snapshotMargin: 5
 * });
 * ```
 */
export function createTestEventStore<T extends EventSourcedAggregateRoot>(
    aggregateFactory: AggregateFactory<T>,
    options: TestEventStoreOptions = {}
): EventStore<T> {
    const { withSnapshots = false, snapshotMargin = 10 } = options;

    const eventBus = new EventBus();
    const dbal = new InMemoryEventStore();
    const snapshotDbal = withSnapshots ? new InMemorySnapshotStoreDBAL() : undefined;

    return new EventStore<T>(
        aggregateFactory,
        dbal,
        eventBus,
        snapshotDbal,
        snapshotMargin
    );
}

/**
 * Simple test repository implementation.
 * Extends the abstract Repository class for use in tests.
 */
class TestRepository<T extends EventSourcedAggregateRoot> extends Repository<T> {
    constructor(eventStore: EventStore<T>) {
        super(eventStore);
    }
}

/**
 * Creates a test repository with in-memory event store.
 * Useful for testing command handlers and application services that depend on repositories.
 *
 * @typeParam T - The event-sourced aggregate root type
 * @param aggregateFactory - Constructor for the aggregate root class
 * @param options - Optional configuration for the underlying event store
 * @returns A repository instance ready for testing
 *
 * @example
 * ```typescript
 * const orderRepository = createTestRepository(Order);
 *
 * const order = new Order('order-123');
 * order.create();
 * await orderRepository.save(order);
 *
 * const loaded = await orderRepository.load('order-123');
 * ```
 */
export function createTestRepository<T extends EventSourcedAggregateRoot>(
    aggregateFactory: AggregateFactory<T>,
    options: TestEventStoreOptions = {}
): Repository<T> {
    const eventStore = createTestEventStore(aggregateFactory, options);
    return new TestRepository(eventStore);
}

/**
 * Configuration options for test kernel creation.
 */
export interface TestKernelOptions {
    /**
     * Additional parameters to pass to the kernel.
     * Useful for overriding default configuration in tests.
     */
    parameters?: Map<string, unknown>;
}

/**
 * Creates a Kernel instance configured with the provided module context.
 * Uses in-memory infrastructure, suitable for integration testing.
 *
 * @param moduleContext - The module context to load into the kernel
 * @param options - Optional configuration for the kernel
 * @returns A configured Kernel instance ready for testing
 *
 * @example
 * ```typescript
 * const CustomerModule = new ModuleContext({
 *   commands: [CreateCustomerHandler],
 *   services: {
 *     'customer.repository': { instance: CustomerRepository }
 *   }
 * });
 *
 * const kernel = await createTestKernel(CustomerModule);
 * await kernel.app.run(new CreateCustomer('customer-123', 'John Doe'));
 * ```
 */
export async function createTestKernel(
    moduleContext: ModuleContext,
    options: TestKernelOptions = {}
): Promise<Kernel> {
    const { parameters = new Map() } = options;
    return Kernel.createFromModuleContext('test', parameters, moduleContext);
}
