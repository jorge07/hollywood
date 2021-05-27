import { InvalidUsername } from "../error/invalid-username";

export class Username {
    public readonly value: string;

    public static fromLiteral(username: string): Username {
        return new Username(username);
    }

    private constructor(username: string) {
        Username.validate(username);
        this.value = username;
    }

    private static validate(username: string) {
        if (username.length < 3) {
            throw new InvalidUsername(username, 'Username should container at least 3 characters');
        }
    }
}
