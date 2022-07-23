# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
// PEG syntax: "test"
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
// PEG syntax: [a-z]
const parser = P.regexp(/[a-z]/);

const result = parser.handler('a', 0, {});
if (result.success) {
	console.log(result.value);
	// => "a"
}
```

## P.seq(parsers: Parser[], select?: boolean): Parser

```ts
// PEG syntax: "a" "1"
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
// PEG syntax: value0:"a" value1:"1" { return value1; }
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
// PEG syntax: "a" / "1"
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
// PEG syntax: value0:"a" value1:"b" value2:"c" { return [value0, value2]; }
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
// PEG syntax: $("a" "b" "c")
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

## parser.sep(separator: Parser, min: number): Parser

## parser.option(): Parser
Generates a new parser that returns null even if the match fails.

```ts
// PEG syntax: "a" "b"?
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

## P.success()
for custom parser.

## P.failure()
for custom parser.
