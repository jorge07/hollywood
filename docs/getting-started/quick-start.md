# Quick Start

Build your first Hollywood module with dependency injection.

## What You'll Build

A simple logger service using Hollywood's `ModuleContext` and dependency injection.

## Project Structure

```
my-app/
├── config/
│   └── index.ts
├── src/
│   ├── kernel.ts
│   └── modules/
│       └── shared/
│           └── infrastructure/
│               ├── audit/
│               │   └── logger.ts
│               └── shared-module.ts
├── package.json
└── tsconfig.json
```

## Step 1: Define Parameters

Parameters let you configure services. Create a configuration file:

```typescript
// config/index.ts
import { Parameter, UniqueParameterIdentifier } from "hollywood-js/src/Framework/Container/Items/Parameter";

export const parameters = new Map<UniqueParameterIdentifier, Parameter>([
    ["log.level", process.env.LOG_LEVEL || "warn"],
]);
```

> **Tip:** Parameter aliases can be organized into constants or namespaces as your project grows.

## Step 2: Create the Logger Service

Install Winston:

```bash
npm install winston
```

Create the logger:

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

    constructor(@inject("log.level") level: string) {
        this.winston = winston.createLogger({
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

## Step 3: Create a Module

Modules group related services:

```typescript
// src/modules/shared/infrastructure/shared-module.ts
import { Framework } from "hollywood-js";
import Log from "./audit/logger";

const services = new Map()
    .set("logger", { instance: Log });

export const SharedModule = new Framework.ModuleContext({
    services,
});
```

## Step 4: Create the Kernel

The Kernel bootstraps your application:

```typescript
// src/kernel.ts
import { parameters } from "../config";
import { SharedModule } from "./modules/shared/infrastructure/shared-module";
import { Framework } from "hollywood-js";

export default async function KernelFactory(): Promise<Framework.Kernel> {
    return Framework.Kernel.createFromModuleContext(
        process.env.NODE_ENV || "dev",
        parameters,
        SharedModule
    );
}
```

## Step 5: Use Your Service

```typescript
// log.ts
import "reflect-metadata";
import type { ILog } from "./src/modules/shared/infrastructure/audit/logger";
import KernelFactory from "./src/kernel";

(async () => {
    const kernel = await KernelFactory();
    const logger = kernel.container.get<ILog>("logger");

    logger.warn("Look, this is my first warning!");
})();
```

Run it:

```bash
npx tsc && node log.js
```

Output:

```json
{"message":"Look, this is my first warning!","level":"warn"}
```

## What You've Learned

- **Parameters**: Configure services via a parameter map
- **ModuleContext**: Organize services into modules
- **Kernel**: Bootstrap and wire up your application
- **Container**: Retrieve services by their alias

---

**Next:** Learn about [Commands & Handlers](../basics/commands.md)
