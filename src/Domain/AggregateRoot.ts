export type AggregateRootId = string;

export default abstract class AggregateRoot {
    constructor(private readonly aggregateRootId: AggregateRootId) {}

    public getAggregateRootId(): AggregateRootId {
        return this.aggregateRootId;
    }
}
