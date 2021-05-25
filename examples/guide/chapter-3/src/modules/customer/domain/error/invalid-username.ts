export class InvalidUsername extends Error {
    constructor(username: string, reason: string) {
        super(`InvalidUsername: ${username}. Reason: ${reason}`);
    }
}
