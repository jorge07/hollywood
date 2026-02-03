import EventSubscriber from "../EventSourcing/EventBus/EventSubscriber";

/**
 * Type alias for EventSubscriber used in the read model context.
 *
 * Projectors are EventSubscribers that maintain denormalized read models
 * optimized for query performance. They subscribe to domain events and
 * update read model repositories accordingly.
 *
 * This is a type alias rather than a subclass because:
 * 1. Projectors have no additional functionality beyond EventSubscriber
 * 2. The semantic distinction is documented but doesn't require inheritance
 * 3. Prevents empty abstract class anti-pattern
 *
 * To create a projector, extend EventSubscriber directly:
 *
 * @example
 * ```typescript
 * class UserProjector extends EventSubscriber {
 *     constructor(private readonly repository: UserReadModelRepository) {
 *         super();
 *         this.registerHandler(UserCreated, this.onUserCreated.bind(this));
 *     }
 *
 *     private onUserCreated(event: UserCreated): void {
 *         this.repository.save(event.userId, {
 *             id: event.userId,
 *             email: event.email
 *         });
 *     }
 * }
 *
 * // Type the projector using the Projector type alias
 * const projector: Projector = new UserProjector(repository);
 * ```
 */
type Projector = EventSubscriber;

export default Projector;
