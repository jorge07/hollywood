# Installation

Get Hollywood up and running in your TypeScript project.

## Requirements

- **Node.js** 20+ (LTS recommended)
- **TypeScript** 5.0+

## Install Hollywood

```bash
npm install hollywood-js reflect-metadata
```

## TypeScript Configuration

Hollywood uses decorators for dependency injection. Add these compiler options to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true
  }
}
```

## Verify Installation

Create a test file to confirm everything works:

```typescript
import "reflect-metadata";
import { Framework } from "hollywood-js";

console.log("Hollywood installed successfully!");
```

Run it:

```bash
npx ts-node test.ts
```

If you see the success message, you're ready to continue.

## Troubleshooting

Having issues? Check [common setup problems](https://github.com/jorge07/hollywood/issues?q=label%3Asetup) or [open an issue](https://github.com/jorge07/hollywood/issues/new/choose).

---

**Next:** [Quick Start](quick-start.md)
