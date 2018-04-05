import DomainEvent from "../../Domain/Event/DomainEvent";

export default abstract class EventListener {

    public abstract on(event: DomainEvent): void;
}
