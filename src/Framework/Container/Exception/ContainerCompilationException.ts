export default class ContainerCompilationException extends Error {
    constructor(reason: string) {
        super(`Container Compilation Error: ${reason}`);
    }
}
