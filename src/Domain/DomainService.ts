/**
 * Abstract base class for Domain Services.
 *
 * Domain Services encapsulate domain logic that:
 * - Spans multiple aggregates or entities
 * - Doesn't naturally belong to a single entity
 * - Represents a significant process or transformation in the domain
 * - Implements stateless domain operations
 *
 * ## When to Use Domain Services
 *
 * Use a Domain Service when:
 * 1. An operation involves multiple aggregates but shouldn't be in any single aggregate
 * 2. The operation is conceptually a "verb" in the domain language rather than a "noun"
 * 3. The operation doesn't naturally fit as a method on an entity or value object
 * 4. The operation requires orchestration across domain objects
 *
 * ## When NOT to Use Domain Services
 *
 * Avoid Domain Services when:
 * - The operation naturally belongs to an entity or value object
 * - The operation is purely technical (use Application Services instead)
 * - The operation involves infrastructure concerns (use Infrastructure Services)
 * - The operation changes state of a single aggregate (use the aggregate itself)
 *
 * ## Examples
 *
 * Good use cases for Domain Services:
 * ```typescript
 * // Transfer money between accounts (spans two Account aggregates)
 * class MoneyTransferService extends DomainService {
 *   transfer(from: Account, to: Account, amount: Money): void {
 *     from.withdraw(amount);
 *     to.deposit(amount);
 *   }
 * }
 *
 * // Calculate shipping cost (involves Product, ShippingAddress, CarrierRates)
 * class ShippingCostCalculator extends DomainService {
 *   calculate(product: Product, destination: ShippingAddress): Money {
 *     // Complex calculation involving multiple domain concepts
 *   }
 * }
 *
 * // Validate business rules across entities
 * class OrderValidationService extends DomainService {
 *   canPlaceOrder(customer: Customer, order: Order): boolean {
 *     // Check credit limits, order history, product availability
 *   }
 * }
 * ```
 *
 * ## Key Principles
 *
 * - Domain Services are STATELESS - they don't hold domain state
 * - They operate on domain objects passed as parameters
 * - They use the ubiquitous language of the domain
 * - They encapsulate domain knowledge, not technical concerns
 * - They can depend on repositories to load aggregates
 * - They should be injected via dependency injection
 *
 * ## Distinction from Other Service Types
 *
 * - **Domain Service**: Domain logic, works with domain objects, no infrastructure
 * - **Application Service**: Orchestrates use cases, coordinates domain and infrastructure
 * - **Infrastructure Service**: Technical concerns (email, file I/O, external APIs)
 *
 * @abstract
 * @example
 * ```typescript
 * import { DomainService } from '@hollywood-js/core';
 *
 * export class TransferMoneyService extends DomainService {
 *   constructor(
 *     private readonly accountRepository: IAccountRepository,
 *     private readonly eventBus: IEventBus
 *   ) {
 *     super();
 *   }
 *
 *   async transfer(
 *     fromAccountId: AccountId,
 *     toAccountId: AccountId,
 *     amount: Money
 *   ): Promise<void> {
 *     const fromAccount = await this.accountRepository.find(fromAccountId);
 *     const toAccount = await this.accountRepository.find(toAccountId);
 *
 *     // Domain logic - enforcing invariants across aggregates
 *     fromAccount.withdraw(amount);
 *     toAccount.deposit(amount);
 *
 *     await this.accountRepository.save(fromAccount);
 *     await this.accountRepository.save(toAccount);
 *
 *     // Publish domain event
 *     await this.eventBus.publish(
 *       new MoneyTransferred(fromAccountId, toAccountId, amount)
 *     );
 *   }
 * }
 * ```
 */
export default abstract class DomainService {
    /**
     * Domain Services should be stateless.
     * Override this constructor only if you need to inject dependencies.
     */
    protected constructor() {
        // Marker class - intentionally empty
        // Subclasses will inject their dependencies via constructor
    }
}
