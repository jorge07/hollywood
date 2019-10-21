import DomainMessage from "../../Domain/Event/DomainMessage";

export default abstract class EventSubscriber {

    public on(message: DomainMessage): void {
        const method = "on" + message.eventType;

        if (this[method]) {
            this[method](message.event);
        }
    }
}
