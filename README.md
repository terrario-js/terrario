<h1><img src="https://github.com/marihachi/terrario/blob/875bcc5ae47e351419d2c0f7d30b739b4c72840f/assets/terrario-logo.svg?raw=true" alt="Terrario" width="230px" /></h1>

[![Test](https://github.com/marihachi/terrario/actions/workflows/test.yml/badge.svg)](https://github.com/marihachi/terrario/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A refined, expressive parser combinator library.
[Try it out!](https://npm.runkit.com/terrario)

- 📍 Minimal yet powerful APIs
- 🖨 Scannerless parsing
- ⚙ Supports conditional control by state
- ✨ Zero dependency

The Terrario is inspired by PEG.js, Parsimmon, etc.

## Installation
```
npm i terrario
```

## Documentation
[Docs](https://github.com/marihachi/terrario/tree/develop/docs/index.md)

## Basic Example
```ts
import * as T from 'terrario';

// build a parser
const parser = T.alt([
  T.str('hello'),
  T.str('world'),
  T.str(' '),
]).many();

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
