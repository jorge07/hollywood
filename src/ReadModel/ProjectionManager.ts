import type IEventStoreDBAL from "../EventSourcing/IEventStoreDBAL";
import type { IProjectionPositionStore } from "./ProjectionPositionStore";
import type Projector from "./Projector";

export default class ProjectionManager {
    constructor(
        private readonly eventStore: IEventStoreDBAL,
        private readonly positionStore: IProjectionPositionStore
    ) {}

    /**
     * Rebuild a projection from scratch by replaying all events from position 0.
     * This resets the projection position and processes all events.
     */
    public async rebuild(projector: Projector): Promise<void> {
        const projectorName = this.getProjectorName(projector);

        await this.positionStore.reset(projectorName);

        await this.processEventsFrom(projector, 0);
    }

    /**
     * Catch up a projection from its last processed position.
     * Useful for incremental updates after projection is back online.
     */
    public async catchUp(projector: Projector): Promise<void> {
        const projectorName = this.getProjectorName(projector);
        const currentPosition = await this.getPosition(projectorName);

        await this.processEventsFrom(projector, currentPosition);
    }

    /**
     * Get the current position of a projector.
     */
    public async getPosition(projectorName: string): Promise<number> {
        const position = await this.positionStore.get(projectorName);
        return position?.lastProcessedPosition ?? 0;
    }

    private async processEventsFrom(projector: Projector, fromPosition: number): Promise<void> {
        const projectorName = this.getProjectorName(projector);
        let processedPosition = fromPosition;

        for await (const message of this.eventStore.loadAll(fromPosition)) {
            await projector.on(message);
            processedPosition++;

            await this.positionStore.save({
                projectionName: projectorName,
                lastProcessedPosition: processedPosition,
                lastProcessedAt: new Date(),
            });
        }
    }

    private getProjectorName(projector: Projector): string {
        return projector.constructor.name;
    }
}
