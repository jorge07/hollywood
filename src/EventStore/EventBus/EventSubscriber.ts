import DomainMessage from "../../Domain/Event/DomainMessage";

export default abstract class EventSubscriber {

    public on(message: DomainMessage): void {
        const method: string = "on" + message.eventType;

        if ((this as any)[method]) {
            (this as any)[method](message.event);
        }
    }
}
