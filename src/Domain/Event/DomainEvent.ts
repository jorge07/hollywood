export default abstract class DomainEvent {
    public name(): string {

        return this.constructor.name;
    }
}
