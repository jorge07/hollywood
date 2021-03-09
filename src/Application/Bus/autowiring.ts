import "reflect-metadata";
import IHandler from "./IHandler";

const metadataKey = "design:paramtypes";
const propertykey = "handle";

export interface IAnnotatedHandler<T extends IHandler>  {
    command: { name: string }
}


export default function autowiring<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    const methodArgs: any = Reflect.getMetadata(metadataKey, target, propertykey);

    target.command = {
        name: methodArgs[0].name,
    };
}
