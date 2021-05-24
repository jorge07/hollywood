# First Module

> If you're not familiar with [ModuleContext concept](/#/concepts/module-context) I recommend you to read about it before.

One of the first things you set up use to be a logger, so let's drive by example:

# Configuration

Logger will require levels of verbosity, so let's add a parameter to configure it, no dependencies to add just a ts file:

```typescript
// config/index.ts
import { Parameter, UniqueParameterIdentifier } from "hollywood-js/src/Framework/Container/Items/Parameter";

export const parameters = new Map<UniqueParameterIdentifier, Parameter>([
    [
        "log.level", // This will be the parameter "alias" we'll use to refer to this parameter
        process.env.LOG_LEVEL || "warn", // Default log level for us will be warn
    ],
]);
```

> **Alias** can grow a lot so feel free to move it to a constants file, namespace it or manage it the way you feel more comfortable with. Hollywood doesn't force you to a predefined way.

# Our Logger

We like [Winston](https://www.npmjs.com/package/winston) and the console.

First, let's install the dependency:

```bash
yarn add winston
```

```typescript
// src/modules/shared/infrastructure/audit/logger.ts

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
```

# The Shared Module

Here we define our Module. It will contain our logger:

```typescript
// src/modules/shared/infrastructure/shared-module.ts

import {Framework} from "hollywood-js";
import Log from "./audit/logger";

const services = (new Map())
    .set("logger", { instance: Log })
;
export const SharedModule = new Framework.ModuleContext({
    services,
});
```

# The Kernel

We'll do the binding for our configuration and application.

```typescript
// src/kernel.ts
import { parameters } from "../config";
import { SharedModule } from "./modules/shared/infrastructure/shared-module";
import {Framework} from "hollywood-js";

export default async function KernelFactory(): Promise<Framework.Kernel> {
    return Framework.Kernel.createFromModuleContext(
        process.env.NODE_ENV|| 'dev',
        parameters,
        SharedModule
    );
}
```

Let's run this:

```typescript
// log.ts
import type { ILog } from "src/modules/shared/infrastructure/audit/logger";
import KernelFactory from "./src/kernel";

(async () => {
    const kernel = await KernelFactory();
    const logger = kernel.container.get<Ilog>("logger");
    
    logger.warn('Look, this is my frist warning!');
})()
```

# Run the example

```bash
$ ./node_modules/.bin/tsc
```

```bash
$ node log.js             
{"message":"Look, this is my first warning!","level":"warn"}
```

# Help?

> Found any issue? Want some clarification? Open an issue [here](https://github.com/jorge07/hollywood/issues/new/choose) please
