import { Container } from "inversify";
import type { ParametersList } from "./Items/Parameter";
import type ModuleContext from "../Modules/ModuleContext";
export declare function BuildFromModuleContext(parameters: ParametersList, moduleContext: ModuleContext): Promise<Container>;
