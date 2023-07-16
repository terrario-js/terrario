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
        handler: wrapByTraceHandler(handler, this.name),
        children,
      };
      this.name = name;
    }
  }

  /**
   * internal method
  */
  evalContext(): PatternContext<T, U> {
    // if not evaluated yet
    if (typeof this.ctx == 'function') {
      const pattern = this.ctx();
      const ctx = pattern.evalContext();
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
  exec(input: string, offset: number, state: any): Result<T> {
    const ctx = this.evalContext();
    return ctx.handler(input, offset, ctx.children, state);
  }

  parse(input: string, state: any = {}): Result<T> {
    const pattern = seq([this, eof], 0);
    return pattern.exec(input, 0, state);
  }

  /**
   * Experimental API
  */
  find(input: string, state: any = {}): { index: number, input: string, result: Result<T> } | undefined {
    for (let i = 0; i < input.length; i++) {
      const innerState = Object.assign({}, state);
      const result = this.exec(input, i, innerState);
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
      const result = this.exec(input, i, innerState);
      if (result.success) {
        results.push({ index: i, input, result });
      }
    }
    return results;
  }

  map<U>(fn: (value: T) => U): Pattern<U> {
    return new Pattern((input, index, children, state) => {
      const result = children[0].exec(input, index, state);
      if (!result.success) {
        return result;
      }
      return success(result.index, fn(result.value));
    }, [this]);
  }

  text(): Pattern<string> {
    return new Pattern((input, index, children, state) => {
      const result = children[0].exec(input, index, state);
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

export type PatternHandler<T, U extends Pattern<any>[]> = (input: string, index: number, children: [...U], state: any) => Result<T>;

export type PatternContext<T, U extends Pattern<any>[] = any> = {
  handler: PatternHandler<T, U>;
  children: [...U];
};

export type LazyContext<T, U extends Pattern<any>[] = any> =
  () => Pattern<T, U>;

type ResultType<T> = T extends Pattern<infer R> ? R : never;
type ResultTypes<T> = T extends [infer Head, ...infer Tail] ? [ResultType<Head>, ...ResultTypes<Tail>] : [];

function wrapByTraceHandler<T, U extends Pattern<any>[] = any>(handler: PatternHandler<T, U>, name?: string): PatternHandler<T, U> {
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

function many<T>(pattern: Pattern<T>, min: number): Pattern<T[]> {
  return new Pattern((input, index, children, state) => {
    let result;
    let latestIndex = index;
    const accum: T[] = [];
    while (latestIndex < input.length) {
      result = children[0].exec(input, latestIndex, state);
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
  }, [pattern]);
}

function manyWithout<T>(pattern: Pattern<T>, min: number, terminator: Pattern<unknown>): Pattern<T[]> {
  return many(seq([
    notMatch(terminator),
    pattern,
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

export function seq<T extends Pattern<any>[]>(patterns: [...T]): Pattern<ResultTypes<[...T]>>
export function seq<T extends Pattern<any>[], U extends number>(patterns: [...T], select: U): T[U]
export function seq(patterns: Pattern<any>[], select?: number) {
  return (select == null) ? seqAll(patterns) : seqSelect(patterns, select);
}

function seqAll<T extends Pattern<any>[]>(patterns: [...T]): Pattern<ResultTypes<[...T]>> {
  return new Pattern((input, index, children, state) => {
    let result;
    let latestIndex = index;
    const accum = [];
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, latestIndex, state);
      if (!result.success) {
        return result;
      }
      latestIndex = result.index;
      accum.push(result.value);
    }
    return success(latestIndex, (accum as ResultTypes<[...T]>));
  }, patterns);
}

function seqSelect<T extends Pattern<any>[], U extends number>(patterns: [...T], select: U): T[U] {
  return seqAll(patterns).map(values => values[select]);
}

export function alt<T extends Pattern<unknown>[]>(patterns: [...T]): Pattern<ResultTypes<T>[number]> {
  return new Pattern((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, index, state) as Result<ResultTypes<T>[number]>;
      if (result.success) {
        return result;
      }
    }
    return failure(index);
  }, patterns);
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

export function match<T>(pattern: Pattern<T>): Pattern<T> {
  return new Pattern((input, index, children, state) => {
    const result = children[0].exec(input, index, state);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, [pattern]);
}

export function notMatch(pattern: Pattern<unknown>): Pattern<null> {
  return new Pattern((input, index, children, state) => {
    const result = children[0].exec(input, index, state);
    return !result.success
      ? success(index, null)
      : failure(index);
  }, [pattern]);
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
  if (sof.exec(input, index, state).success) {
    return success(index, null);
  }
  if (cr.exec(input, index - 1, state).success) {
    return success(index, null);
  }
  if (lf.exec(input, index - 1, state).success) {
    return success(index, null);
  }
  return failure(index);
}, []);

export const lineEnd = match(alt([
  eof,
  cr,
  lf,
])).map(() => null);

//type Syntax<T> = (rules: Record<string, Pattern<T>>) => Pattern<T>;
//type SyntaxReturn<T> = T extends (rules: Record<string, Pattern<any>>) => infer R ? R : never;
//export function createLanguage2<T extends Record<string, Syntax<any>>>(syntaxes: T): { [K in keyof T]: SyntaxReturn<T[K]> } {

// TODO: 関数の型宣言をいい感じにしたい
export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: Record<string, Pattern<any>>) => T[K] }): T {
  const rules: Record<string, Pattern<any>> = {};
  for (const key of Object.keys(syntaxes)) {
    rules[key] = lazy(() => {
      const pattern = (syntaxes as any)[key](rules);
      if (pattern == null || !(pattern instanceof Pattern)) {
        throw new Error('syntax must return a Pattern.');
      }
      pattern.name = key;
      return pattern;
    });
  }
  return rules as any;
}
