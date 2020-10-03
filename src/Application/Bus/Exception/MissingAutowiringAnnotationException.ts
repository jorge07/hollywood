export default class MissingAutowiringAnnotationException extends Error {
    constructor(target: object) {
        super(`Missing @autowiring annotation in ${target.constructor.name} command/query`);
    }
}