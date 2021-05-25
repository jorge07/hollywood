import { parameters } from "../config";
import { Framework } from "hollywood-js";
import { CustomerModule } from "./modules/customer/infrastructure/customer-module";

export default async function KernelFactory(): Promise<Framework.Kernel> {
    return Framework.Kernel.createFromModuleContext(
        process.env.NODE_ENV || 'dev',
        parameters,
        CustomerModule,
        new Map<string,any>()
    );
}
