WIP!


# Parser APIs

## parser.parse(input: string, state?: any): Result
```ts
const parser = T.str('a');

parser.parse('a');

// specify states
parser.parse('a', { flag: true, count: 0 });
```

## parser.map(fn: (value) => any): Parser
```ts
// [Equivalent PEG] value0:"a" value1:"b" value2:"c" { return [value0, value2]; }
const parser = T.seq([
  T.str('a'),
  T.str('b'),
  T.str('c'),
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
const parser = T.seq([
  T.str('a'),
  T.str('b'),
  T.str('c'),
]).text();

const result = parser.parse('abc');
console.log(result);
// => { success: true, value: 'abc', index: 3 }
```

## parser.many(min: number): Parser

Matches 0 or more items:
```ts
// [Equivalent PEG] "abc"*
const parser = T.str('abc').many(0);

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
const parser = T.str('abc').many(1);

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
const parser = T.seq([
  T.str('a'),
  T.str('b').option(),
]);

let result;

result = parser.parse('ab');
console.log(result);
// => { success: true, value: [ 'a', 'b' ], index: 2 }

result = parser.parse('a');
console.log(result);
// => { success: true, value: [ 'a', null ], index: 1 }
```

# Combinators

## T.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
// [Equivalent PEG] "test"
const parser = T.str('test');

const result = parser.parse('test');
console.log(result);
// => { success: true, value: 'test', index: 4 }
```

## T.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

```ts
// [Equivalent PEG] [a-z]
const parser = T.regexp(/[a-z]/);

const result = parser.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## T.seq(parsers: Parser[], select?: boolean): Parser

```ts
// [Equivalent PEG] "a" "1"
const parser = T.seq([
  T.str('a'),
  T.str('1'),
]);

const result = parser.parse('a1');
console.log(result);
// => { success: true, value: [ 'a', '1' ], index: 2 }
```

You can also select a result to be returned from all of them:
```ts
// [Equivalent PEG] value0:"a" value1:"1" { return value1; }
const parser = T.seq([
  T.str('a'),
  T.str('1'),
], 1);

const result = parser.parse('a1');
console.log(result);
// => { success: true, value: '1', index: 2 }
```

## T.alt(parsers: Parser[]): Parser

```ts
// [Equivalent PEG] "a" / "1"
const parser = T.alt([
  T.str('a'),
  T.str('1'),
]);

let result;

result = parser.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }

result = parser.parse('1');
console.log(result);
// => { success: true, value: '1', index: 1 }
```

## T.sep(item: Parser, separator: Parser, min: number): Parser

```ts
let parser, result;

// (1)
// [Equivalent PEG] head:"a" tail:("," @"a")* { return [head, ...tail]; }
parser = T.sep(T.str('a'), T.str(','), 1);

result = parser.parse('a');
console.log(result);
// => { success: true, value: [ 'a' ], index: 1 }

result = parser.parse('a,a');
console.log(result);
// => { success: true, value: [ 'a', 'a' ], index: 3 }

// (2)
// [Equivalent PEG]
// newline = "\r\n" / [\r\n]
// item = $(!newline .)+
// parser = head:item tail:(newline @item)* { return [head, ...tail]; }
parser = T.sep(T.seq([
  T.notMatch(T.newline),
  T.char
], 1).many(0).text(), T.newline, 1);

result = parser.parse('abc\r\nxyz');
console.log(result);
// => { success: true, value: [ 'abc', 'xyz' ], index: 8 }
```

## T.lazy(fn: () => Parser): Parser
Generates a new parser that is lazy-evaluated.

Normally there is no need to use this API. Use T.createLanguage() instead.

## T.succeeded(value: any): Parser

```ts
//TODO
```

## T.match(parser: Parser): Parser
Generates a new parser to continue if the match is successful.
The generated parser does not consume input.

```ts
// [Equivalent PEG] &"a" "abc"
const parser = T.seq([
  T.match(T.str('a')),
  T.str('abc'),
]);
const result = parser.parse('abc');
console.log(result);
// => { success: true, value: [ 'a', 'abc' ], index: 3 }
```

## T.notMatch(parser: Parser): Parser
Generates a new parser to continue if the match fails.
The generated parser does not consume input.

```ts
// [Equivalent PEG] !"x" "abc"
const parser = T.seq([
  T.notMatch(T.str('x')),
  T.str('abc'),
]);
const result = parser.parse('abc');
console.log(result);
// => { success: true, value: [ null, 'abc' ], index: 3 }
```

## T.cond(predicate: (state: any) => boolean): Parser
Conditional branching can be performed using the state.

```ts
const parser = T.seq([
  T.cond(state => state.enabled),
  T.char,
]);

const result = parser.parse('a', { enabled: true });
console.log(result);
// => { success: true, value: [ null, 'a' ], index: 1 }
```

# Parsers

## T.cr: Parser
Matches `\r` (CR)

## T.lf: Parser
Matches `\n` (LF)

## T.crlf: Parser
Matches `\r\n` (CR + LF)

## T.newline: Parser
Matches `\r\n` or `\r` or `\n`

## T.eof: Parser
Matches end of input string

```ts
// [Equivalent PEG] "a" !.
const parser = T.seq([
  T.str('a'),
  T.eof,
]);

const result = parser.parse('a');
console.log(result);
// => { success: true, value: [ 'a', null ], index: 1 }
```

## T.char: Parser
Matches any character.

```ts
// [Equivalent PEG] .
const parser = T.char;

const result = parser.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## T.lineBegin: Parser

```ts
//TODO
```

## T.lineEnd: Parser

```ts
//TODO
```

# Other APIs

## T.createLanguage(syntaxes: Record<string, (rules: Language) => Parser>): Language
You can use createLanguage to create a set of syntax.

Each rule is lazy evaluated.

```ts
const lang = T.createLanguage({
  root: rules => {
    return T.alt([
      rules.rule1,
      rules.rule2,
    ]);
  },

  rule1: rules => {
    return T.regexp('a');
  },

  rule2: rules => {
    return T.regexp('b');
  },
});

const result = lang.root.parse('a');
console.log(result);
// => { success: true, value: 'a', index: 1 }
```

## custom parser (constructor of Parser class)

```ts
const parser = new Parser((input, index, state) => {
  if (index >= input.length) {
    return T.failure();
  }
  return T.success(index, 'result value');
});
```

### T.success()
for custom parser.

### T.failure()
for custom parser.
