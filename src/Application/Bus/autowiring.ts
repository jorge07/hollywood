import "reflect-metadata";
import IHandler from "./IHandler";

const metadataKey = "design:paramtypes";
const propertykey = "handle";

export interface IAnnotatedHandler<T extends IHandler>  {
    command: { name: string }
}

/**
 * Decorator for autowiring command handlers.
 * Extracts the command type from method parameters using reflection metadata.
 *
 * @param target - The class prototype
 * @param propertyKey - The name of the method being decorated
 * @param descriptor - The property descriptor for the method
 *
 * Note: Uses `any` for target type due to decorator signature requirements
 * and dynamic property assignment.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function autowiring<T>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const methodArgs: unknown[] | undefined = Reflect.getMetadata(metadataKey, target, propertykey);

    if (methodArgs && methodArgs.length > 0 && typeof methodArgs[0] === 'function') {
        target.command = {
            name: (methodArgs[0] as { name: string }).name,
        };
    }
}
