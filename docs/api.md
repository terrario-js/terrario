# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
// [Equivalent PEG] "test"
const parser = P.str('test');

const result = parser.parse('test');
console.log(result);
// => { success: true, value: 'test', index: 4 }
```

## P.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

```ts
// [Equivalent PEG] [a-z]
const parser = P.regexp(/[a-z]/);

const result = parser.parse('a');
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

const result = parser.parse('a1');
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

const result = parser.parse('a1');
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

result = parser.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }

result = parser.parse('1');
console.log(result);
// => { success: true, value: '1', index: 1 }
```

## P.sep(item: Parser, separator: Parser, min: number): Parser

```ts
// [Equivalent PEG] head:"a" tail:("," @"a")* { return [head, ...tail]; }
const parser = P.sep(P.str('a'), P.str(','), 1);

let result;

result = parser.parse('a');
console.log(result);
// => { success: true, value: [ 'a' ], index: 1 }

result = parser.parse('a,a');
console.log(result);
// => { success: true, value: [ 'a', 'a' ], index: 3 }
```

## P.match(parser: Parser): Parser
Generates a new parser to continue if the match is successful.
The generated parser does not consume input.

```ts
// TODO
```

## P.notMatch(parser: Parser): Parser
Generates a new parser to continue if the match fails.
The generated parser does not consume input.

```ts
// TODO
```

# Parsers

## P.char: Parser
Matches any character.

```ts
// [Equivalent PEG] .
const parser = P.char;

const result = parser.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## P.cr: Parser
Matches `\r` (CR)

## P.lf: Parser
Matches `\n` (LF)

## P.newline: Parser
Matches `\r\n` or `\r` or `\n`

# Parser APIs

## parser.parse(input: string, state?: any): Result
```ts
const parser = P.str('a');

parser.parse('a');

// specify states
parser.parse('a', { flag: true, count: 0 });
```

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

const result = parser.parse('abc');
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

const result = parser.parse('abc');
console.log(result);
// => { success: true, value: 'abc', index: 3 }
```

## parser.many(min: number): Parser

Matches 0 or more items:
```ts
// [Equivalent PEG] "abc"*
const parser = P.str('abc').many(0);

let result;

result = parser.parse('');
console.log(result);
// => { success: true, value: [], index: 0 }

result = parser.parse('abc');
console.log(result);
// => { success: true, value: [ 'abc' ], index: 3 }
```

Matches 1 or more items:
```ts
// [Equivalent PEG] "abc"+
const parser = P.str('abc').many(1);

let result;

result = parser.parse('abc');
console.log(result);
// => { success: true, value: [ 'abc' ], index: 3 }

result = parser.parse('abcabc');
console.log(result);
// => { success: true, value: [ 'abc', 'abc' ], index: 6 }
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

result = parser.parse('ab');
console.log(result);
// => { success: true, value: [ 'a', 'b' ], index: 2 }

result = parser.parse('a');
console.log(result);
// => { success: true, value: [ 'a', null ], index: 1 }
```

# Other APIs

## P.createLanguage(syntaxes: Record<string, (rules: Language) => Parser>): Language
You can use createLanguage to create a set of syntax.

Each rule is lazy evaluated.

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

const result = lang.root.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## P.success()
for custom parser.

## P.failure()
for custom parser.
