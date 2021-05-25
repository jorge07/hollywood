import type { Username } from "./value-object/username";

export class Customer {
    constructor(public readonly userId: string, public readonly username: Username) {}
}
