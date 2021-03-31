export declare type AggregateRootId = string;
export default abstract class AggregateRoot {
    private readonly aggregateRootId;
    constructor(aggregateRootId: AggregateRootId);
    getAggregateRootId(): AggregateRootId;
}
