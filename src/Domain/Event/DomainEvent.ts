export default abstract class DomainEvent {
    public domainEventName(): string {
        return this.constructor.name;
    }
}
