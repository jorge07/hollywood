# ModuleContext

ModuleContext is an encapsulation tool. Groups a domain area definition and define dependencies.

Main --> A,B

```typescript
import ModuleContext from "./ModuleContext";

const ModuleA = new ModuleContext({service, commands, queries})
const ModuleB = new ModuleContext({service, commands, queries})
const mainModule = new ModuleContext({service, commands, queries, modules: [ModuleA, ModuleB]})
```

Main --> B --> A
```typescript
import ModuleContext from "./ModuleContext";

const ModuleA = new ModuleContext({service, commands, queries})
const ModuleB = new ModuleContext({service, commands, queries, module: [ModuleA]})
const mainModule = new ModuleContext({service, commands, queries, modules: [ModuleB]})
```
