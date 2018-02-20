export abstract class DomainEvent {
    public ocurrendOn: Date;
    public playhead: number;
    public aggregateRootId: number;

    constructor(){
        this.ocurrendOn = new Date()
    }
}