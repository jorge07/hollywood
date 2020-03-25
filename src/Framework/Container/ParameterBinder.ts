import { Container, interfaces } from "inversify";
import { Parameter, ParametersList } from "./Items/Parameter";

export default function parameterBinder(container: Container, parameters: ParametersList): void {
    parameters.forEach((parameter: Parameter, key: string) => {
        container.bind(key).toConstantValue(parameter);
    });
}
