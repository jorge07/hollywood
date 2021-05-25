import type { ILog } from "./src/modules/shared/infrastructure/audit/logger";
import KernelFactory from "./src/kernel";

(async () => {
    const kernel = await KernelFactory();
    const logger = kernel.container.get<ILog>("logger");

    logger.warn('Look, this is my frist warning!');
})()
