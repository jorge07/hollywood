export default class MissingAutowiringAnnotationException extends Error {
    constructor(target: object, methodName: string = 'handle') {
        const className = target.constructor.name;
        const message = [
            `Handler '${className}.${methodName}' is missing @autowiring decorator.`,
            ``,
            `To fix this issue:`,
            `1. Import the decorator: import { autowiring } from '@hollywood-js/core'`,
            `2. Add @autowiring above the ${methodName} method in ${className}`,
            ``,
            `Example:`,
            `  @autowiring`,
            `  public async ${methodName}(command: YourCommand): Promise<void> {`,
            `    // handler implementation`,
            `  }`
        ].join('\n');

        super(message);
        this.name = 'MissingAutowiringAnnotationException';
    }
}