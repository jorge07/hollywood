import type DomainMessage from "../../Domain/Event/DomainMessage";
import type IEventListener from "./IEventListener";

export default abstract class EventSubscriber implements IEventListener {

    public async on(message: DomainMessage): Promise<void> {
        const method: string = "on" + message.eventType;
        if ((this as any)[method]) {
            await (this as any)[method](message.event);
        }
    }
}
