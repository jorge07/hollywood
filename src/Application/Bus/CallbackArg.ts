export interface IAppResponse {
    data: any;
    meta: any[];
}

export interface IAppError extends Partial<IAppResponse> {
    message: string;
    code: number;

}
