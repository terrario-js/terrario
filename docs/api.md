# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
// [Equivalent PEG] "test"
const parser = P.str('test');

const result = parser.handler('test', 0, {});
console.log(result);
// => { success: true, value: 'test', index: 4 }
```

## P.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

```ts
// [Equivalent PEG] [a-z]
const parser = P.regexp(/[a-z]/);

const result = parser.handler('a', 0, {});
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## P.seq(parsers: Parser[], select?: boolean): Parser

```ts
// [Equivalent PEG] "a" "1"
const parser = P.seq([
  P.str('a'),
  P.str('1'),
]);

const result = parser.handler('a1', 0, {});
console.log(result);
// => { success: true, value: [ 'a', '1' ], index: 2 }
```

You can also select a result to be returned from all of them:
```ts
// [Equivalent PEG] value0:"a" value1:"1" { return value1; }
const parser = P.seq([
  P.str('a'),
  P.str('1'),
], 1);

const result = parser.handler('a1', 0, {});
console.log(result);
// => { success: true, value: '1', index: 2 }
```

## P.alt(parsers: Parser[]): Parser

```ts
// [Equivalent PEG] "a" / "1"
const parser = P.alt([
  P.str('a'),
  P.str('1'),
]);

let result;

result = parser.handler('a', 0, {});
console.log(result);
// => { success: true, value: 'a', index: 1 }

result = parser.handler('1', 0, {});
console.log(result);
// => { success: true, value: '1', index: 1 }
```

## P.notMatch(parser: Parser): Parser
Generates a new parser to continue if the match fails.
The generated parser does not consume input.

```ts
// TODO
```

# Parsers

## P.char
Matches any character.

```ts
// [Equivalent PEG] .
const parser = P.char;

const result = parser.handler('a', 0, {});
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## P.cr
Matches `\r` (CR)

## P.lf
Matches `\n` (LF)

## P.newline
Matches `\r\n` or `\r` or `\n`

# Parser APIs

## parser.map(fn: (value) => any): Parser
```ts
// [Equivalent PEG] value0:"a" value1:"b" value2:"c" { return [value0, value2]; }
const parser = P.seq([
  P.str('a'),
  P.str('b'),
  P.str('c'),
]).map(value => {
  return [value[0], value[2]];
});

const result = parser.handler('abc', 0, {});
console.log(result);
// => { success: true, value: [ 'a', 'c' ], index: 3 }
```

## parser.text(): Parser
```ts
// [Equivalent PEG] "a" "b" "c" { return text(); }
const parser = P.seq([
  P.str('a'),
  P.str('b'),
  P.str('c'),
]).text();

const result = parser.handler('abc', 0, {});
console.log(result);
// => { success: true, value: 'abc', index: 3 }
```

## parser.many(min: number): Parser

Matches 0 or more items:
```ts
// [Equivalent PEG] "abc"*
const parser = P.str('abc').many(0);

let result;

result = parser.handler('', 0, {});
console.log(result);
// => { success: true, value: [], index: 0 }

result = parser.handler('abc', 0, {});
console.log(result);
// => { success: true, value: [ 'abc' ], index: 3 }
```

Matches 1 or more items:
```ts
// [Equivalent PEG] "abc"+
const parser = P.str('abc').many(1);

let result;

result = parser.handler('abc', 0, {});
console.log(result);
// => { success: true, value: [ 'abc' ], index: 3 }

result = parser.handler('abcabc', 0, {});
console.log(result);
// => { success: true, value: [ 'abc', 'abc' ], index: 6 }
```

## parser.sep(separator: Parser, min: number): Parser

```ts
// [Equivalent PEG] head:"a" tail:("," @"a")* { return [head, ...tail]; }
const item = P.str('a');
const parser = item.sep(P.str(','), 1);

let result;

result = parser.handler('a', 0, {});
console.log(result);
// => { success: true, value: [ 'a' ], index: 1 }

result = parser.handler('a,a', 0, {});
console.log(result);
// => { success: true, value: [ 'a', 'a' ], index: 3 }
```

## parser.option(): Parser
Generates a new parser that returns null even if the match fails.

```ts
// [Equivalent PEG] "a" "b"?
const parser = P.seq([
  P.str('a'),
  P.str('b').option(),
]);

let result;

result = parser.handler('ab', 0, {});
console.log(result);
// => { success: true, value: [ 'a', 'b' ], index: 2 }

result = parser.handler('a', 0, {});
console.log(result);
// => { success: true, value: [ 'a', null ], index: 1 }
```

# Other APIs

## P.createLanguage()
You can use createLanguage to create a set of syntax.

```ts
const lang = P.createLanguage({
  root: rules => {
    return P.alt([
      rules.rule1,
      rules.rule2,
    ]);
  },

  rule1: rules => {
    return P.regexp('a');
  },

  rule2: rules => {
    return P.regexp('b');
  },
});

const result = lang.root.handler('a', 0, {});
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## P.success()
for custom parser.

## P.failure()
for custom parser.
