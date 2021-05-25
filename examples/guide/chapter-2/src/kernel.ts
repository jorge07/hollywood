import { parameters } from "../config";
import { SharedModule } from "./modules/shared/infrastructure/shared-module";
import {Framework} from "hollywood-js";

export default async function KernelFactory(): Promise<Framework.Kernel> {
    return Framework.Kernel.createFromModuleContext(
        process.env.NODE_ENV || 'dev',
        parameters,
        SharedModule,
        new Map<string,any>()
    );
}
