export default class ConcurrencyException extends Error {
    constructor(
        public readonly aggregateId: string,
        public readonly expectedVersion: number,
        public readonly actualVersion: number
    ) {
        super(`Concurrency conflict for aggregate ${aggregateId}: expected version ${expectedVersion}, actual ${actualVersion}`);
    }
}
