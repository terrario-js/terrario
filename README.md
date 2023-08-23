<h1><img src="https://github.com/marihachi/terrario/blob/875bcc5ae47e351419d2c0f7d30b739b4c72840f/assets/terrario-logo.svg?raw=true" alt="Terrario" width="230px" /></h1>

[![Test](https://github.com/marihachi/terrario/actions/workflows/test.yml/badge.svg)](https://github.com/marihachi/terrario/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A refined, expressive parser combinator library.
[Try it out!](https://npm.runkit.com/terrario)

- 📍 Minimal yet powerful APIs
- 🖨 Supports scannerless parsing and tokens parsing
- ⚙ Supports conditional control by state
- ✨ Zero dependency

The Terrario is inspired by PEG.js, Parsimmon, etc.

## Installation
```
npm i terrario
```

## Documentation
See [Website](https://terrario-js.github.io/)

## Basic Example
```ts
import * as T from 'terrario';

// build a parser
const parser = T.alt([
  T.token('hello'),
  T.token('world'),
  T.token(' '),
]).many();

// parse the input string
const input = 'hello world';
const result = parser.parse(input);

console.log(result);
// => { success: true, value: [ 'hello', ' ', 'world' ], index: 11 }
```

## Examples
- [JSON parser](https://github.com/terrario-js/terrario/tree/9f5c16e7451429297354fec4fe6f8f010da6d70b/examples/json)
- [calculator](https://github.com/terrario-js/terrario/tree/9f5c16e7451429297354fec4fe6f8f010da6d70b/examples/calculator)

## License
MIT License
