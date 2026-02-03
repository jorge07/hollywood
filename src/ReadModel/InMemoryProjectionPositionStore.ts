import type { ProjectionPosition } from "./ProjectionPosition";
import type { IProjectionPositionStore } from "./ProjectionPositionStore";

export default class InMemoryProjectionPositionStore implements IProjectionPositionStore {
    private readonly positions: Map<string, ProjectionPosition> = new Map();

    public async get(projectionName: string): Promise<ProjectionPosition | null> {
        return this.positions.get(projectionName) ?? null;
    }

    public async save(position: ProjectionPosition): Promise<void> {
        this.positions.set(position.projectionName, position);
    }

    public async reset(projectionName: string): Promise<void> {
        this.positions.delete(projectionName);
    }
}
