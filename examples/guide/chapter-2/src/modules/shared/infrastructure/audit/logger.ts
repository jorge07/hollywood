import { inject } from "inversify";
import * as winston from "winston";

export interface ILog {
    info(message: string, ...meta: any[]): void;
    warn(message: string, ...meta: any[]): void;
    error(message: string, ...meta: any[]): void;
}

export default class Log implements ILog {
    private readonly winston: winston.Logger;
    constructor(
        @inject("log.level") level: string,    // We reference here to the **Alias** on the config
    ) {
        this.winston = winston.createLogger({ // Let's send all logs to console in json format
            format: winston.format.json(),
            level,
            transports: [
                new winston.transports.Console({
                    format: winston.format.json(),
                }),
            ],
        });
    }

    public info(message: string, ...meta: any[]) {
        this.winston.info(message, ...meta);
    }

    public warn(message: string, ...meta: any[]) {
        this.winston.warn(message, ...meta);
    }

    public error(message: string, ...meta: any[]) {
        this.winston.error(message, ...meta);
    }
}
