# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
// [Equivalent PEG] "test"
const parser = P.str('test');

const result = parser.handler('test', 0, {});
if (result.success) {
  console.log(result.value);
  // => "test"
}
```

## P.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

```ts
// [Equivalent PEG] [a-z]
const parser = P.regexp(/[a-z]/);

const result = parser.handler('a', 0, {});
if (result.success) {
  console.log(result.value);
  // => "a"
}
```

## P.seq(parsers: Parser[], select?: boolean): Parser

```ts
// [Equivalent PEG] "a" "1"
const parser = P.seq([
  P.str('a'),
  P.str('1'),
]);

const result = parser.handler('a1', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["a", "1"]
}
```

You can also select a result to be returned from all of them:
```ts
// [Equivalent PEG] value0:"a" value1:"1" { return value1; }
const parser = P.seq([
  P.str('a'),
  P.str('1'),
], 1);

const result = parser.handler('a1', 0, {});
if (result.success) {
  console.log(result.value);
  // => "1"
}
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
if (result.success) {
  console.log(result.value);
  // => "a"
}

result = parser.handler('1', 0, {});
if (result.success) {
  console.log(result.value);
  // => "1"
}
```

## P.notMatch(parser: Parser): Parser
Generates a new parser to continue if the match fails.
The generated parser does not consume input.


# Parsers

## P.char

## P.cr

## P.lf

## P.newline


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
if (result.success) {
  console.log(result.value);
  // => ["a", "c"]
}
```

## parser.text(): Parser
```ts
// [Equivalent PEG] $("a" "b" "c")
const parser = P.seq([
  P.str('a'),
  P.str('b'),
  P.str('c'),
]).text();

const result = parser.handler('abc', 0, {});
if (result.success) {
  console.log(result.value);
  // => "abc"
}
```

## parser.many(min: number): Parser

Matches 0 or more items:
```ts
// [Equivalent PEG] "abc"*
const parser = P.str('abc').many(0);

let result;

result = parser.handler('', 0, {});
if (result.success) {
  console.log(result.value);
  // => []
}

result = parser.handler('abc', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["abc"]
}
```

Matches 1 or more items:
```ts
// [Equivalent PEG] "abc"+
const parser = P.str('abc').many(1);

let result;

result = parser.handler('abc', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["abc"]
}

result = parser.handler('abcabc', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["abc", "abc"]
}
```

## parser.sep(separator: Parser, min: number): Parser

```ts
// [Equivalent PEG] head:"a" tail:("," @"a")* { return [head, ...tail]; }
const item = P.str('a');
const parser = item.sep(P.str(','), 1);

let result;

result = parser.handler('a', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["a"]
}

result = parser.handler('a,a', 0, {});
if (result.success) {
  console.log(result.value);
  // => ["a", "a"]
}
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
if (result.success) {
  console.log(result.value);
  // => "ab"
}

result = parser.handler('a', 0, {});
if (result.success) {
  console.log(result.value);
  // => "a"
}
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
if (result.success) {
  console.log(result.value);
  // => "a"
}
```

## P.success()
for custom parser.

## P.failure()
for custom parser.
