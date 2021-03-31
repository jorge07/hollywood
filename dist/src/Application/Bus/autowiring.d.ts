import "reflect-metadata";
import IHandler from "./IHandler";
export interface IAnnotatedHandler<T extends IHandler> {
    command: {
        name: string;
    };
}
export default function autowiring<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): void;
