export type Success<T> = {
  success: true;
  index: number;
  value: T;
};

export function success<T>(index: number, value: T): Success<T> {
  return {
    success: true,
    value: value,
    index: index,
  };
}

export type Failure = {
  success: false;
  index: number;
};

export function failure(index: number): Failure {
  return {
    success: false,
    index: index,
  };
}

export type Result<T> = Success<T> | Failure;

export class Parser<T, U extends Parser<any>[] = any> {
  name?: string;
  ctx: ParserContext<T, U> | LazyContext<T, U>;

  /** constructor */
  constructor(handler: ParserHandler<T, U>, children: [...U], name?: string)
  /** constructor (lazy) */
  constructor(ctx: LazyContext<T, U>, name?: string)
  constructor(arg1: ParserHandler<T, U> | LazyContext<T, U>, arg2?: [...U] | string, arg3?: string) {
    if (arg2 == null || typeof arg2 == 'string') {
      // lazy
      const ctx = arg1 as LazyContext<T, U>;
      const name = arg2;
      this.ctx = ctx;
      this.name = name;
    } else {
      const handler = arg1 as ParserHandler<T, U>;
      const children = arg2;
      const name = arg3;
      this.ctx = {
        handler: wrapByTraceHandler(handler, this.name),
        children,
      };
      this.name = name;
    }
  }

  /**
   * internal method
  */
  evalContext(): ParserContext<T, U> {
    // if not evaluated yet
    if (typeof this.ctx == 'function') {
      const parser = this.ctx();
      const ctx = parser.evalContext();
      this.ctx = {
        handler: wrapByTraceHandler(ctx.handler, this.name),
        children: ctx.children,
      };
    }
    return this.ctx;
  }

  /**
   * Experimental API
  */
  exec(input: string, state: any = {}, offset: number = 0): Result<T> {
    const ctx = this.evalContext();
    return ctx.handler(input, offset, ctx.children, state);
  }

  parse(input: string, state: any = {}): Result<T> {
    const parser = seq([this, eof], 0);
    return parser.exec(input, state, 0);
  }

  /**
   * Experimental API
  */
  find(input: string, state: any = {}): { index: number, input: string, result: Result<T> } | undefined {
    for (let i = 0; i < input.length; i++) {
      const innerState = Object.assign({}, state);
      const result = this.exec(input, innerState, i);
      if (result.success) {
        return { index: i, input, result };
      }
    }
    return undefined;
  }

  /**
   * Experimental API
  */
  findAll(input: string, state: any = {}): { index: number, input: string, result: Result<T> }[] {
    const results = [];
    for (let i = 0; i < input.length; i++) {
      const innerState = Object.assign({}, state);
      const result = this.exec(input, innerState, i);
      if (result.success) {
        results.push({ index: i, input, result });
      }
    }
    return results;
  }

  map<U>(fn: (value: T) => U): Parser<U> {
    return new Parser((input, index, [child], state) => {
      const result = child.exec(input, state, index);
      if (!result.success) {
        return result;
      }
      return success(result.index, fn(result.value));
    }, [this]);
  }

  text(): Parser<string> {
    return new Parser((input, index, [child], state) => {
      const result = child.exec(input, state, index);
      if (!result.success) {
        return result;
      }
      const text = input.slice(index, result.index);
      return success(result.index, text);
    }, [this]);
  }

  many(min: number): Parser<T[]>
  many(min: number, terminator: Parser<unknown>): Parser<T[]>
  many(min: number, terminator?: Parser<unknown>): Parser<T[]> {
    return (terminator != null) ? manyWithout(this, min, terminator) : many(this, min);
  }

  option(): Parser<T | null> {
    return alt([
      this,
      succeeded(null),
    ]);
  }
}

export type ParserHandler<T, U extends Parser<any>[]> = (input: string, index: number, children: [...U], state: any) => Result<T>;

export type ParserContext<T, U extends Parser<any>[] = any> = {
  handler: ParserHandler<T, U>;
  children: [...U];
};

export type LazyContext<T, U extends Parser<any>[] = any> =
  () => Parser<T, U>;

type ResultType<T> = T extends Parser<infer R> ? R : never;
type ResultTypes<T> = T extends [infer Head, ...infer Tail] ? [ResultType<Head>, ...ResultTypes<Tail>] : [];

function wrapByTraceHandler<T, U extends Parser<any>[] = any>(handler: ParserHandler<T, U>, name?: string): ParserHandler<T, U> {
  return (input, index, children, state) => {
    if (state.trace && name != null) {
      const pos = `${index}`;
      console.log(`${pos.padEnd(6, ' ')}enter ${name}`);
      const result = handler(input, index, children, state);
      if (result.success) {
        const pos = `${index}:${result.index}`;
        console.log(`${pos.padEnd(6, ' ')}match ${name}`);
      } else {
        const pos = `${index}`;
        console.log(`${pos.padEnd(6, ' ')}fail ${name}`);
      }
      return result;
    }
    return handler(input, index, children, state);
  };
}

function many<T>(parser: Parser<T>, min: number): Parser<T[]> {
  return new Parser((input, index, [child], state) => {
    let result;
    let latestIndex = index;
    const accum: T[] = [];
    while (latestIndex < input.length) {
      result = child.exec(input, state, latestIndex);
      if (!result.success) {
        break;
      }
      latestIndex = result.index;
      accum.push(result.value);
    }
    if (accum.length < min) {
      return failure(latestIndex);
    }
    return success(latestIndex, accum);
  }, [parser]);
}

function manyWithout<T>(parser: Parser<T>, min: number, terminator: Parser<unknown>): Parser<T[]> {
  return many(seq([
    notMatch(terminator),
    parser,
  ], 1), min);
}

export function str<T extends string>(value: T): Parser<T>
export function str(pattern: RegExp): Parser<string>
export function str(value: string | RegExp): Parser<string> {
  return (typeof value == 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<T extends string>(value: T): Parser<T> {
  return new Parser((input, index, [], _state) => {
    if ((input.length - index) < value.length) {
      return failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return failure(index);
    }
    return success(index + value.length, value);
  }, []);
}

function strWithRegExp(pattern: RegExp): Parser<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return new Parser((input, index, [], _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return failure(index);
    }
    return success(index + result[0].length, result[0]);
  }, []);
}

export function seq<T extends Parser<any>[]>(parsers: [...T]): Parser<ResultTypes<[...T]>>
export function seq<T extends Parser<any>[], U extends number>(parsers: [...T], select: U): T[U]
export function seq(parsers: Parser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<T extends Parser<any>[]>(parsers: [...T]): Parser<ResultTypes<[...T]>> {
  return new Parser((input, index, children, state) => {
    let result;
    let latestIndex = index;
    const accum = [];
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, state, latestIndex);
      if (!result.success) {
        return result;
      }
      latestIndex = result.index;
      accum.push(result.value);
    }
    return success(latestIndex, (accum as ResultTypes<[...T]>));
  }, parsers);
}

function seqSelect<T extends Parser<any>[], U extends number>(parsers: [...T], select: U): T[U] {
  return seqAll(parsers).map(values => values[select]);
}

export function alt<T extends Parser<unknown>[]>(parsers: [...T]): Parser<ResultTypes<T>[number]> {
  return new Parser((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, state, index) as Result<ResultTypes<T>[number]>;
      if (result.success) {
        return result;
      }
    }
    return failure(index);
  }, parsers);
}

export function sep<T>(item: Parser<T>, separator: Parser<unknown>, min: number): Parser<T[]> {
  if (min < 1) {
    throw new Error('"min" must be a value greater than or equal to 1.');
  }
  return seq([
    item,
    seq([
      separator,
      item,
    ], 1).many(min - 1),
  ]).map(result => [result[0], ...result[1]]);
}

export function lazy<T>(fn: () => Parser<T>): Parser<T> {
  return new Parser(fn);
}

export function succeeded<T>(value: T): Parser<T> {
  return new Parser((_input, index, [], _state) => {
    return success(index, value);
  }, []);
}

export function match<T>(parser: Parser<T>): Parser<T> {
  return new Parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, [parser]);
}

export function notMatch(parser: Parser<unknown>): Parser<null> {
  return new Parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return !result.success
      ? success(index, null)
      : failure(index);
  }, [parser]);
}

export function cond(predicate: (state: any) => boolean): Parser<null> {
  return new Parser((_input, index, [], state) => {
    return predicate(state)
      ? success(index, null)
      : failure(index);
  }, []);
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');
export const newline = alt([crlf, cr, lf]);

export const sof = new Parser((_input, index, [], _state) => {
  return index == 0
    ? success(index, null)
    : failure(index);
}, []);

export const eof = new Parser((input, index, [], _state) => {
  return index >= input.length
    ? success(index, null)
    : failure(index);
}, []);

export const char = new Parser((input, index, [], _state) => {
  if ((input.length - index) < 1) {
    return failure(index);
  }
  const value = input.charAt(index);
  return success(index + 1, value);
}, []);

export const lineBegin = new Parser((input, index, [], state) => {
  if (sof.exec(input, state, index).success) {
    return success(index, null);
  }
  if (cr.exec(input, state, index - 1).success) {
    return success(index, null);
  }
  if (lf.exec(input, state, index - 1).success) {
    return success(index, null);
  }
  return failure(index);
}, []);

export const lineEnd = match(alt([
  eof,
  cr,
  lf,
])).map(() => null);

//type Syntax<T> = (rules: Record<string, Parser<T>>) => Parser<T>;
//type SyntaxReturn<T> = T extends (rules: Record<string, Parser<any>>) => infer R ? R : never;
//export function createLanguage2<T extends Record<string, Syntax<any>>>(syntaxes: T): { [K in keyof T]: SyntaxReturn<T[K]> } {

// TODO: 関数の型宣言をいい感じにしたい
export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: Record<string, Parser<any>>) => T[K] }): T {
  const rules: Record<string, Parser<any>> = {};
  for (const key of Object.keys(syntaxes)) {
    rules[key] = lazy(() => {
      const parser = (syntaxes as any)[key](rules);
      if (parser == null || !(parser instanceof Parser)) {
        throw new Error('syntax must return a Parser.');
      }
      parser.name = key;
      return parser;
    });
  }
  return rules as any;
}
