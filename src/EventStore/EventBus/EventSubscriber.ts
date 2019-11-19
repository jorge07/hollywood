import DomainMessage from "../../Domain/Event/DomainMessage";

export default abstract class EventSubscriber {

    public async on(message: DomainMessage): Promise<void> {
        const method: string = "on" + message.eventType;

        if ((this as any)[method]) {
            await (this as any)[method](message.event);
        }
    }
}
