export type Success<T> = {
  success: true;
  index: number;
  value: T;
};

export type Failure = {
  success: false;
  index: number;
};

export type Result<T> = Success<T> | Failure;
export type PatternHandler<T, U extends Pattern<any>[]> = (input: string, index: number, children: [...U], state: any) => Result<T>;

type PatternResult<T> = T extends Pattern<infer R> ? R : never;
type PatternResults<T> = T extends [infer Head, ...infer Tail] ? [PatternResult<Head>, ...PatternResults<Tail>] : [];

export type PatternContext<T, U extends Pattern<any>[] = any> = {
  handler: PatternHandler<T, U>;
  children: [...U];
};

export type LazyContext<T, U extends Pattern<any>[] = any> =
  () => Pattern<T, U>;

export function success<T>(index: number, value: T): Success<T> {
  return {
    success: true,
    value: value,
    index: index,
  };
}

export function failure(index: number): Failure {
  return {
    success: false,
    index: index,
  };
}

export class Pattern<T, U extends Pattern<any>[] = any> {
  name?: string;
  ctx: PatternContext<T, U> | LazyContext<T, U>;

  /** constructor */
  constructor(handler: PatternHandler<T, U>, children: [...U], name?: string)
  /** constructor (lazy) */
  constructor(ctx: LazyContext<T, U>, name?: string)
  constructor(arg1: PatternHandler<T, U> | LazyContext<T, U>, arg2?: [...U] | string, arg3?: string) {
    if (arg2 == null || typeof arg2 == 'string') {
      // lazy
      const ctx = arg1 as LazyContext<T, U>;
      const name = arg2;
      this.ctx = ctx;
      this.name = name;
    } else {
      const handler = arg1 as PatternHandler<T, U>;
      const children = arg2;
      const name = arg3;
      this.ctx = {
        handler: Pattern.wrapOuterHandler(handler),
        children,
      };
      this.name = name;
    }
  }

  /**
   * internal method
  */
  eval(): PatternContext<T, U> {
    // if not evaluated yet
    if (typeof this.ctx == 'function') {
      const pattern = this.ctx();
      const ctx = pattern.eval();
      this.ctx = {
        handler: Pattern.wrapOuterHandler(ctx.handler),
        children: ctx.children,
      };
    }
    return this.ctx;
  }

  /**
   * internal method
  */
  handle(input: string, index: number, state: any): Result<T> {
    const ctx = this.eval();
    return ctx.handler(input, index, ctx.children, state);
  }

  /**
   * internal method
  */
  private static wrapOuterHandler<T, U extends Pattern<any>[] = any>(handler: PatternHandler<T, U>): PatternHandler<T, U> {
    return (input, index, children, state) => {
      if (state.trace && this.name != null) {
        const pos = `${index}`;
        console.log(`${pos.padEnd(6, ' ')}enter ${this.name}`);
        const result = handler(input, index, children, state);
        if (result.success) {
          const pos = `${index}:${result.index}`;
          console.log(`${pos.padEnd(6, ' ')}match ${this.name}`);
        } else {
          const pos = `${index}`;
          console.log(`${pos.padEnd(6, ' ')}fail ${this.name}`);
        }
        return result;
      }
      return handler(input, index, children, state);
    };
  }

  parse(input: string, state: any = {}): Result<T> {
    const pattern = seq([this, eof], 0);
    return pattern.handle(input, 0, state);
  }

  /**
   * Experimental API
  */
  find(input: string, state: any = {}) {
    for (let i = 0; i < input.length; i++) {
      const innerState = Object.assign({}, state);
      const result = this.handle(input, i, innerState);
      if (result.success) {
        return { index: i, input, result };
      }
    }
    return null;
  }

  /**
   * Experimental API
  */
  findAll(input: string, state: any = {}) {
    const results = [];
    for (let i = 0; i < input.length; i++) {
      const innerState = Object.assign({}, state);
      const result = this.handle(input, i, innerState);
      if (result.success) {
        results.push({ index: i, input, result });
      }
    }
    return results;
  }

  map<U>(fn: (value: T) => U): Pattern<U> {
    return new Pattern((input, index, children, state) => {
      const result = children[0].handle(input, index, state);
      if (!result.success) {
        return result;
      }
      return success(result.index, fn(result.value));
    }, [this]);
  }

  text(): Pattern<string> {
    return new Pattern((input, index, children, state) => {
      const result = children[0].handle(input, index, state);
      if (!result.success) {
        return result;
      }
      const text = input.slice(index, result.index);
      return success(result.index, text);
    }, [this]);
  }

  many(min: number): Pattern<T[]>
  many(min: number, terminator: Pattern<unknown>): Pattern<T[]>
  many(min: number, terminator?: Pattern<unknown>): Pattern<T[]> {
    return (terminator != null) ? manyWithout(this, min, terminator) : many(this, min);
  }

  option(): Pattern<T | null> {
    return alt([
      this,
      succeeded(null),
    ]);
  }
}

function many<T>(parser: Pattern<T>, min: number): Pattern<T[]> {
  return new Pattern((input, index, children, state) => {
    let result;
    let latestIndex = index;
    const accum: T[] = [];
    while (latestIndex < input.length) {
      result = children[0].handle(input, latestIndex, state);
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

function manyWithout<T>(parser: Pattern<T>, min: number, terminator: Pattern<unknown>): Pattern<T[]> {
  return many(seq([
    notMatch(terminator),
    parser,
  ], 1), min);
}

export function str<T extends string>(value: T): Pattern<T>
export function str(pattern: RegExp): Pattern<string>
export function str(value: string | RegExp): Pattern<string> {
  return (typeof value == 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<T extends string>(value: T): Pattern<T> {
  return new Pattern((input, index, _children, _state) => {
    if ((input.length - index) < value.length) {
      return failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return failure(index);
    }
    return success(index + value.length, value);
  }, []);
}

function strWithRegExp(pattern: RegExp): Pattern<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return new Pattern((input, index, _children, _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return failure(index);
    }
    return success(index + result[0].length, result[0]);
  }, []);
}

export function seq<T extends Pattern<any>[]>(parsers: [...T]): Pattern<PatternResults<[...T]>>
export function seq<T extends Pattern<any>[], U extends number>(parsers: [...T], select: U): T[U]
export function seq(parsers: Pattern<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<T extends Pattern<any>[]>(parsers: [...T]): Pattern<PatternResults<[...T]>> {
  return new Pattern((input, index, children, state) => {
    let result;
    let latestIndex = index;
    const accum = [];
    for (let i = 0; i < children.length; i++) {
      result = children[i].handle(input, latestIndex, state);
      if (!result.success) {
        return result;
      }
      latestIndex = result.index;
      accum.push(result.value);
    }
    return success(latestIndex, (accum as PatternResults<[...T]>));
  }, parsers);
}

function seqSelect<T extends Pattern<any>[], U extends number>(parsers: [...T], select: U): T[U] {
  return seqAll(parsers).map(values => values[select]);
}

export function alt<T extends Pattern<unknown>[]>(parsers: [...T]): Pattern<PatternResults<T>[number]> {
  return new Pattern((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].handle(input, index, state) as Result<PatternResults<T>[number]>;
      if (result.success) {
        return result;
      }
    }
    return failure(index);
  }, parsers);
}

export function sep<T>(item: Pattern<T>, separator: Pattern<unknown>, min: number): Pattern<T[]> {
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

export function lazy<T>(fn: () => Pattern<T>): Pattern<T> {
  return new Pattern(fn);
}

export function succeeded<T>(value: T): Pattern<T> {
  return new Pattern((_input, index, _children, _state) => {
    return success(index, value);
  }, []);
}

export function match<T>(parser: Pattern<T>): Pattern<T> {
  return new Pattern((input, index, children, state) => {
    const result = children[0].handle(input, index, state);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, [parser]);
}

export function notMatch(parser: Pattern<unknown>): Pattern<null> {
  return new Pattern((input, index, children, state) => {
    const result = children[0].handle(input, index, state);
    return !result.success
      ? success(index, null)
      : failure(index);
  }, [parser]);
}

export function cond(predicate: (state: any) => boolean): Pattern<null> {
  return new Pattern((input, index, _children, state) => {
    return predicate(state)
      ? success(index, null)
      : failure(index);
  }, []);
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');
export const newline = alt([crlf, cr, lf]);

export const sof = new Pattern((_input, index, _children, _state) => {
  return index == 0
    ? success(index, null)
    : failure(index);
}, []);

export const eof = new Pattern((input, index, _children, _state) => {
  return index >= input.length
    ? success(index, null)
    : failure(index);
}, []);

export const char = new Pattern((input, index, _children, _state) => {
  if ((input.length - index) < 1) {
    return failure(index);
  }
  const value = input.charAt(index);
  return success(index + 1, value);
}, []);

export const lineBegin = new Pattern((input, index, _children, state) => {
  if (sof.handle(input, index, state).success) {
    return success(index, null);
  }
  if (cr.handle(input, index - 1, state).success) {
    return success(index, null);
  }
  if (lf.handle(input, index - 1, state).success) {
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
export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: Record<string, Pattern<any>>) => T[K] }): T {
  const rules: Record<string, Pattern<any>> = {};
  for (const key of Object.keys(syntaxes)) {
    rules[key] = lazy(() => {
      const parser = (syntaxes as any)[key](rules);
      if (parser == null || !(parser instanceof Pattern)) {
        throw new Error('syntax must return a parser.');
      }
      parser.name = key;
      return parser;
    });
  }
  return rules as any;
}
