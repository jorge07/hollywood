import type DomainMessage from "../../Domain/Event/DomainMessage";
import type IEventListener from "./IEventListener";
export default abstract class EventSubscriber implements IEventListener {
    on(message: DomainMessage): Promise<void>;
}
