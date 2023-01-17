WIP!

## Get started

Terrario can be easily introduced using npm.  
Install Terrario in the current directory with the following command:
```
$ npm i terrario
```

Terrario supports both TypeScript and JavaScript.

Let's begin by creating a basic parser that works with Node.js.  
As a simple example, create a parser that takes a string containing comma-separated numbers and converts it into an array of numbers.  
Please write the following contents and save it as index.js. This time, it is written in JavaScript.
```js
const T = require('terrario');

const number = T.seq([
  T.str(/[1-9]/),
  T.str(/[0-9]/).many(0),
]).text().map(x => {
  return parseInt(x);
});
const parser = T.sep(number, T.str(','));

console.log(parser.parse('123,456'));
console.log(parser.parse('222'));
console.log(parser.parse('aaa'));
```

The program uses some functions called combinators.
The combinator creates a new parser based on the contents of the arguments.
- `T.seq` receives an array of parsers and generates a parser that applies them in order. The parser succeeds only if the input string can be consumed in the specified order.  

Execute the program with the following command:
```
$ node index.js
```

Output:
```js
{ success: true, value: [ 123, 456 ], index: 7 }
{ success: true, value: [ 222 ], index: 3 }
{ success: false, index: 0 }
```

The input string is converted to an array of numbers.  
We can also see that it fails for invalid inputs.

As you can see, we were able to create the parser with relatively few descriptions.

## Language parsing
TODO

## Conditional branching by state
TODO

## Custom parsers
TODO
