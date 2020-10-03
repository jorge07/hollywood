import "reflect-metadata";
import type ICommandHandler from "./Command/CommandHandler";
import type IQueryHandler from "./Query/QueryHandler";

const metadataKey = "design:paramtypes";
const propertykey = "handle";

export interface IAnnotatedCommandHandler extends ICommandHandler {
    command: { name: string }
}
export interface IAnnotatedQueryHandler extends IQueryHandler {
    command: { name: string }
}

export default function autowiring<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    const methodArgs: any = Reflect.getMetadata(metadataKey, target, propertykey);

    target.command = {
        name: methodArgs[0].name,
    };
}
