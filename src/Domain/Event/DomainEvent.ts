export default abstract class DomainEvent {
    public readonly ocurrendOn: Date;
    public playhead: number;
    public aggregateRootId: string;

    constructor() {
        this.ocurrendOn = new Date();
    }
}
