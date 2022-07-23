# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

```ts
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
const parser = P.regexp(/[a-z]/);

const result = parser.handler('a', 0, {});
if (result.success) {
	console.log(result.value);
	// => "a"
}
```

## P.seq(parsers: Parser[], select?: boolean): Parser

```ts
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

## parser.text(): Parser

## parser.many(min: number): Parser

## parser.sep(separator: Parser, min: number): Parser

## parser.option(): Parser
Generates a new parser that returns null even if the match fails.


# Other APIs

## P.createLanguage()
You can use createLanguage to create a set of syntax.

## P.success()
for custom parser.

## P.failure()
for custom parser.
