# terrario
A Parsimmon-like, stateful parser-combinator library with TypeScript.
[Try it out!](https://npm.runkit.com/terrario)

[![NPM](https://nodei.co/npm/terrario.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/terrario)

## Installation
```
npm i terrario
```

## Documenation
coming soon.

## Basic Example
```ts
import * as P from 'terrario';

// build a parser
const parser = P.str('hello world');

// parse the input string
const input = 'hello world';
const result = parser.handler(input, 0, {});

// check errors
if (!result.success) {
  throw new Error('parsing failed.');
}

// show the parsed value
console.log(result.value);
// => "hello world"
```

## Examples
- [JSON parsing](https://github.com/marihachi/terrario/tree/develop/examples/json)

## License
MIT License
