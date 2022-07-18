# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

## P.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

## P.seq(parsers: Parser[], select?: boolean): Parser

## P.alt(parsers: Parser[]): Parser

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
