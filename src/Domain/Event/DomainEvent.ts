export default abstract class DomainEvent {
    public readonly ocurrendOn: Date;
    public playhead: number;

    constructor() {
        this.ocurrendOn = new Date();
    }
}
