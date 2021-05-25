import "reflect-metadata";
import type { ILog } from "./src/modules/shared/infrastructure/audit/logger";
import KernelFactory from "./src/kernel";
import CreateCommand from "./src/modules/customer/application/command/create/command";

(async () => {
    const kernel = await KernelFactory();
    const logger = kernel.container.get<ILog>("logger");

    const uuid = "uuid-fake";
    await kernel.app.handle(new CreateCommand(uuid, "Valid-Username"))
    logger.warn(`User created with uuid: ${uuid}`);
})()
