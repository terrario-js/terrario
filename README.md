# Terrario
A simple parser-combinator library with TypeScript.
[Try it out!](https://npm.runkit.com/terrario)

- simple APIs
- stateful parsing is supported

The Terrario is inspired by PEG.js, Parsimmon, etc.

[![NPM](https://nodei.co/npm/terrario.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/terrario)

## Installation
```
npm i terrario
```

## Documenation
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

// check errors
if (!result.success) {
  throw new Error('parsing failed.');
}

console.log(result);
// => { success: true, value: [ 'hello', ' ', 'world' ], index: 11 }
```

## Examples
- [JSON parsing](https://github.com/marihachi/terrario/tree/develop/examples/json)

## License
MIT License
