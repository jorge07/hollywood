import DomainMessage from "../../Domain/Event/DomainMessage";

export default abstract class EventSubscriber {

    public on(message: DomainMessage): void {
        if (this["on" + message.eventType]) {
            this["on" + message.eventType](message.event);
        }
    }
}
