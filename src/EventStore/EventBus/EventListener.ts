import type IEventListener from "./IEventListener";
import DomainMessage from "../../Domain/Event/DomainMessage";

export default abstract class EventListener implements IEventListener {
    public abstract on(message: DomainMessage): Promise<void>|void;
}
