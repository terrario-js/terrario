# Terrario
A simple parser-combinator library with TypeScript.
[Try it out!](https://npm.runkit.com/terrario)

[![Test](https://github.com/marihachi/terrario/actions/workflows/test.yml/badge.svg)](https://github.com/marihachi/terrario/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

<img alt="Terrario" src="https://github.com/marihachi/terrario/blob/develop/assets/terrario-logo.png?raw=true" />

- 📍Simple APIs
- ⚙Supports conditional branching by state
- ✨Zero dependency

The Terrario is inspired by PEG.js, Parsimmon, etc.

[![NPM](https://nodei.co/npm/terrario.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/terrario)

## Installation
```
npm i terrario
```

## Documentation
[Docs](https://github.com/marihachi/terrario/tree/develop/docs/index.md)

## Basic Example
```ts
import * as P from 'terrario';

// build a parser
const parser = P.alt([
  P.str('hello'),
  P.str('world'),
  P.str(' '),
]).many(0);

// parse the input string
const input = 'hello world';
const result = parser.parse(input);

console.log(result);
// => { success: true, value: [ 'hello', ' ', 'world' ], index: 11 }
```

## Examples
- [JSON parsing](https://github.com/marihachi/terrario/tree/develop/examples/json)

## License
MIT License
