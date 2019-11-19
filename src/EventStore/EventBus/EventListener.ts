import { DomainMessage } from "../../Domain";

export default abstract class EventListener {

    public abstract on(message: DomainMessage): Promise<void>|void;
}
