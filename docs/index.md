# Combinators

## P.str(value: string): Parser
Generates a new parser that consumes the input string using the specified string.

## P.regexp(pattern: Regexp): Parser
Generates a new parser that consumes the input string using the specified regular expression.

## P.seq(parsers: Parser[], select?: boolean): Parser

## P.alt(parsers: Parser[]): Parser

## P.option(parser: Parser): Parser
Generates a new parser that returns null even if the match fails.

## P.notMatch(parser: Parser): Parser
Generates a new parser to continue if the match fails.
The generated parser does not consume input.


# Built-in Parsers

## P.char

## P.cr

## P.lf


# Parser API

## parser.map(fn: (value) => any): Parser

## parser.text(): Parser

## parser.many(min: number): Parser

## parser.sep1(separator: Parser): Parser


# General APIs

## P.createLanguage()
You can use createLanguage to create a set of syntax.
