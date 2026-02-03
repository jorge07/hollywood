import type { ProjectionPosition } from "./ProjectionPosition";

export interface IProjectionPositionStore {
    get(projectionName: string): Promise<ProjectionPosition | null>;
    save(position: ProjectionPosition): Promise<void>;
    reset(projectionName: string): Promise<void>;
}
