import type IEventListener from "./IEventListener";
import DomainMessage from "../../Domain/Event/DomainMessage";
export default abstract class EventListener implements IEventListener {
    abstract on(message: DomainMessage): Promise<void> | void;
}
