export default interface IMiddleware {
    execute(command: any, next: (command: any ) => any): any;
}
