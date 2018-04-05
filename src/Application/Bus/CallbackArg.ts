export interface IAppResponse {
    data: any;
    meta: any[];
}

export interface IAppError {
    message: string;
    code: number;
    meta: any[];
}
