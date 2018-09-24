export default class InMemoryReadModelRepository {
    private collection: any[] = [];

    public save(id: string, data: any) {
        this.collection[id] = data;
    }

    public oneOrFail(id: string): any {
        const data = this.collection[id];

        if (! data) {
            throw new Error("Not Found");
        }

        return data;
    }
}
