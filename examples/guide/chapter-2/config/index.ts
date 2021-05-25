import { Parameter, UniqueParameterIdentifier } from "hollywood-js/src/Framework/Container/Items/Parameter";

export const parameters = new Map<UniqueParameterIdentifier, Parameter>([
    [
        "log.level", // This will be the parameter "alias" we'll use to refer to this parameter
        process.env.LOG_LEVEL || "warn", // Default log level for us will be warn
    ],
]);
