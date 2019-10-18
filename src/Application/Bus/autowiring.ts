export default function autowiring<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
    const value: any = Reflect.getMetadata(
        "design:paramtypes",
        target,
        "handle",
    );

    target.command = {
        name: value[0].name,
    };
}
