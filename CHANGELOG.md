<!--
## 0.x.x (unreleased)

### Features

### Improvements

### Changes

### Bugfixes

-->

## 0.9.0 (2023/07/21)

- Change: params of T.Parser constructor
- Add: T.parser() API
- Change: parser.many() API
- Change: T.sep() has removed
- Change: T.createLanguage() has renamed to T.language()

## 0.8.1 (2023/07/17)

- Dual package support (ES Modules and CommonJS)

## 0.8.0 (2023/07/17)

- The module system was migrated to ES Module.
- Lazy parser implementation was changed.
- Supported child parsers.
  - Change: Parser constructor
  - Change: parameter of parser handlers
- Added APIs:
  - parser.exec()
  - parser.find()
  - parser.findAll()
  - parser.state()

## 0.7.1 (2022/08/11)

### Bugfixes
- (#12) Inference of type in parser.map() fails caused by T.alt not returning a Parser type.

## 0.7.0 (2022/08/11)

### Features
- Add api: parser.many(min, terminator)
- Add api: T.sof

### Improvements
- Improves rules validation for T.createLanguage()

### Changes
- Change api: T.regexp(RegExp) -> T.str(RegExp)
- When all input strings could not be consumed, an error is now generated.
- Now returns index value on match failure.

## 0.6.0 (2022/08/06)

### Changes
- Improves type inference
  - T.seq (#8 by @ThinaticSystem)
  - T.alt
- Improves type declaration
  - T.regexp
  - T.sep
  - T.notMatch

## 0.5.0 (2022/08/02)

### Features
- Add api: T.eof
- Add api: T.cond
- Add api: T.succeeded

## 0.4.0 (2022/07/24)

### Features
- Add api: parser.parse
- Add api: T.match
- Add api: T.lazy

### Changes
- Change api: parser.sep(separator, min) -> T.sep(item, separator, min)

## 0.3.0 (2022/07/18)

### Features
- Add api: newline

### Changes
- Change api: parser.sep1(separator) -> parser.sep(separator, min)
- Change api: T.option(parser) -> parser.option()

## 0.2.0 (2022/07/17)

### Changes
- Rename api: parser.atLeast(n) -> parser.many(min)
- Rename api: T.any -> T.char

## 0.1.0 (2022/07/16)

Initial release.
