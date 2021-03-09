import type { Container } from "inversify";
import type { ParametersList } from "./Items/Parameter";

export default function parameterBinder(container: Container, parameters: ParametersList): void {
    for (const [key, parameter] of parameters) {
        container.bind(key).toConstantValue(parameter);
    }
}
