export default class InMemoryReadModelRepository {
    private collection;
    save(id: string, data: any): void;
    oneOrFail(id: string): any;
    find(criteria: (results: any) => any): any;
}
