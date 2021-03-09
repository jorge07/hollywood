import DomainMessage from "../../Domain/Event/DomainMessage";

export default interface IEventListener {
    on(message: DomainMessage): void;
}
