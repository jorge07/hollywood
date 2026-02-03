import Identity from "./Identity";

export default abstract class AggregateRoot {
    constructor(private readonly aggregateRootId: Identity) {}

    public getAggregateRootId(): Identity {
        return this.aggregateRootId;
    }
}

export { Identity };
