# Technical Requirements

Before install Hollywood-js you must:
- Run Node ^14.11
- Typescript ^4.0.2
  - Min target: "es6" is your tsconfig.json
  - Experimental Decorators needs to be enabled. Add to your tsconfig.json compilerOptions: `"experimentalDecorators": true`


# Installation

NPM:

`npm install -S hollywood-js`

Yarn:

`yarn add hollywood-js`

# Setup Typescript

NPM
```bash 
npm i typescript --save-dev
```

Yarn
```bash 
yarn add --dev typescript
```

Init your typescript config.

```bash
./node_modules/.bin/tsc --init
```

> Remember: Change target to es6 and enable experimentalDecorators in your tsconfig.json.

This example can be found in the [examples](https://github.com/jorge07/hollywood/tree/master/examples/guide/shared=module)
