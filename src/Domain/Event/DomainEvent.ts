export default abstract class DomainEvent {
    public readonly ocurrendOn: Date;
    public playhead: number;
    public aggregateRootId: number;

    constructor() {
        this.ocurrendOn = new Date();
    }
}
