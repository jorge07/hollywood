import { DomainMessage } from '../../Domain';

export default abstract class EventListener {

    public abstract on(event: DomainMessage): void;
}
