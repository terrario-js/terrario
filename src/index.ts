/**
 * Success result type
 * 
 * @public
*/
export type Success<T> = {
  success: true;
  index: number;
  value: T;
};

/**
 * Make a success result.
 * 
 * @public
*/
export function success<T>(index: number, value: T): Success<T> {
  return {
    success: true,
    value: value,
    index: index,
  };
}

/**
 * Failure result type
 * 
 * @public
*/
export type Failure = {
  success: false;
  index: number;
};

/**
 * Make a failure result.
 * 
 * @public
*/
export function failure(index: number): Failure {
  return {
    success: false,
    index: index,
  };
}

/**
 * Parser result
 * 
 * @public
 */
export type Result<T> = Success<T> | Failure;

/**
 * Parser class
 * 
 * @public
*/
export class Parser<T> {
  name?: string;
  ctx: ParserContext<T> | LazyContext<T>;

  /**
   * Parser constructor
   * 
   * @internal
  */
  constructor(opts: StrictParserOpts<T>)
  /**
   * Parser constructor (Lazy parser)
   * 
   * @internal
  */
  constructor(opts: LazyParserOpts<T>)
  constructor(opts: StrictParserOpts<T> | LazyParserOpts<T>) {
    if (opts.handler != null) {
      this.ctx = {
        handler: wrapByTraceHandler(opts.handler, opts.name),
        children: opts.children || [],
      };
    } else {
      this.ctx = opts.lazy;
    }
    this.name = opts.name;
  }

  /**
   * Evaluate the lazy context.
   * 
   * @internal
  */
  _evalContext(): ParserContext<T> {
    if (typeof this.ctx === 'function') {
      const parser = this.ctx();
      const ctx = parser._evalContext();
      this.ctx = {
        handler: wrapByTraceHandler(ctx.handler, this.name),
        children: ctx.children,
      };
    }
    return this.ctx;
  }

  /**
   * Execute the parser handler.
   * 
   * @public
  */
  exec(input: string, state: any = {}, offset: number = 0): Result<T> {
    const ctx = this._evalContext();
    return ctx.handler(input, offset, ctx.children, state);
  }

  /**
   * Parse an input string.
   * 
   * @public
  */
  parse(input: string, state: any = {}): Result<T> {
    const parser = seq([this, eof], 0);
    return parser.exec(input, state, 0);
  }

  /**
   * Find a pattern from the input string.
   * 
   * @public
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
   * Find all patterns from the input string.
   * 
   * @public
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

  /**
   * Create a new parser that wraps the current parser.
   * The generated parser maps the result of the inner parser and returns it as a result.
   * 
   * @public
  */
  map<U>(fn: (value: T) => U): Parser<U> {
    return createParser((input, index, children, state) => {
      const result = children[0].exec(input, state, index);
      if (!result.success) {
        return result;
      }
      return success(result.index, fn(result.value));
    }, [this]);
  }

  /**
   * Create a new parser that wraps the current parser.
   * The generated parser will return the text in the range matched by the inner parser.
   * 
   * @public
  */
  text(): Parser<string> {
    return createParser((input, index, [child], state) => {
      const result = child.exec(input, state, index);
      if (!result.success) {
        return result;
      }
      const text = input.slice(index, result.index);
      return success(result.index, text);
    }, [this]);
  }

  /**
   * Create a new parser that tries to apply the parser iteratively.
   * 
   * @public
  */
  many(min?: number, max?: number): Parser<T[]>
  /**
   * Create a new parser that tries to apply the parser iteratively.
   * 
   * @public
  */
  many(opts: { min?: number, max?: number, notMatch?: Parser<unknown> }): Parser<T[]>
  many(arg1?: number | { min?: number, max?: number, notMatch?: Parser<unknown> }, arg2?: number): Parser<T[]> {
    if (typeof arg1 === 'number') {
      // with min, max
      return many(this, { min: arg1, max: arg2 });
    } else {
      // with opts
      return many(this, arg1);
    }
  }

  /**
   * Create a new parser that wraps the current parser.
   * The generated parser returns success regardless of whether the inner parser successfully matched.
   * If the inner parser fails, a null value is returned.
   * 
   * @public
  */
  option(): Parser<T | null> {
    return alt([
      this,
      succeeded(null),
    ]);
  }

  /**
   * Create a new parser that wraps the current parser.
   * The generated parser will set the value of the state variable from the given set function and
   * run the inner parser. When the inner parser finishes executing, it restores the value of the
   * state variable.
   * 
   * @public
  */
  state(key: string, value: (state: any) => any): Parser<T> {
    return createParser((input, index, [child], state) => {
      const storedValue = state[key];
      state[key] = value(state);
      const result = child.exec(input, state, index);
      state[key] = storedValue;
      return result;
    }, [this]);
  }
}

/**
 * @internal
*/
export type StrictParserOpts<T> = {
  handler: ParserHandler<T>,
  children?: Parser<any>[],
  name?: string,
  lazy?: undefined,
};

/**
 * @internal
*/
export type LazyParserOpts<T> = {
  lazy: LazyContext<T>,
  name?: string,
  handler?: undefined,
  children?: undefined,
};

/**
 * Type of parser handler
 * 
 * @public
*/
export type ParserHandler<T> = (input: string, index: number, children: Parser<any>[], state: any) => Result<T>;

/**
 * @internal
*/
export type ParserContext<T> = {
  handler: ParserHandler<T>;
  children: Parser<any>[];
};

/**
 * @internal
*/
export type LazyContext<T> =
  () => Parser<T>;

/**
 * Get result type of Parser.
 * 
 * @internal
*/
export type ResultType<T> = T extends Parser<infer R> ? R : never;

/**
 * Get result types of Parsers.
 * 
 * @internal
*/
export type ResultTypes<T> = T extends [infer Head, ...infer Tail] ? [ResultType<Head>, ...ResultTypes<Tail>] : [];

function wrapByTraceHandler<T>(handler: ParserHandler<T>, name?: string): ParserHandler<T> {
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

function many<T>(parser: Parser<T>, opts: { min?: number, max?: number, notMatch?: Parser<unknown> } = {}): Parser<T[]> {
  if (opts.notMatch != null) {
    return many(seq([
      notMatch(opts.notMatch),
      parser,
    ], 1), { min: opts.min, max: opts.max });
  }
  return createParser((input, index, [child], state) => {
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
    if (opts.min != null && accum.length < opts.min) {
      return failure(latestIndex);
    }
    if (opts.max != null && accum.length > opts.max) {
      return failure(latestIndex);
    }
    return success(latestIndex, accum);
  }, [parser]);
}

/**
 * Create a new parser that matches the given string.
 * 
 * @public
*/
export function str<T extends string>(value: T): Parser<T>
/**
 * Create a new parser that matches the given regular expression.
 * 
 * @public
*/
export function str(pattern: RegExp): Parser<string>
export function str(value: string | RegExp): Parser<string> {
  return (typeof value === 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<T extends string>(value: T): Parser<T> {
  return createParser((input, index, [], _state) => {
    if ((input.length - index) < value.length) {
      return failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return failure(index);
    }
    return success(index + value.length, value);
  });
}

function strWithRegExp(pattern: RegExp): Parser<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return createParser((input, index, [], _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return failure(index);
    }
    return success(index + result[0].length, result[0]);
  });
}

/**
 * seq
 * 
 * @public
*/
export function seq<T extends Parser<any>[]>(parsers: [...T]): Parser<ResultTypes<[...T]>>
/**
 * seq
 * 
 * @public
*/
export function seq<T extends Parser<any>[], U extends number>(parsers: [...T], select: U): T[U]
export function seq(parsers: Parser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<T extends Parser<any>[]>(parsers: [...T]): Parser<ResultTypes<[...T]>> {
  return createParser((input, index, children, state) => {
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

/**
 * alt
 * 
 * @public
*/
export function alt<T extends Parser<unknown>[]>(parsers: [...T]): Parser<ResultTypes<T>[number]> {
  return createParser((input, index, children, state) => {
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

/**
 * Create a custom parser.
 * 
 * @public
*/
function createParser<T>(handler: ParserHandler<T>, children?: Parser<any>[], name?: string): Parser<T> {
  return new Parser({ handler, children, name });
}
export { createParser as parser };

/**
 * Create a lazy parser.
 * 
 * @public
*/
export function lazy<T>(fn: () => Parser<T>, name?: string): Parser<T> {
  return new Parser({ lazy: fn, name });
}

/**
 * Create a new parser that already succeeds.
 * 
 * @public
*/
export function succeeded<T>(value: T): Parser<T> {
  return createParser((_input, index, [], _state) => {
    return success(index, value);
  });
}

/**
 * match
 * 
 * @public
*/
export function match<T>(parser: Parser<T>): Parser<T> {
  return createParser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, [parser]);
}

/**
 * notMatch
 * 
 * @public
*/
export function notMatch(parser: Parser<unknown>): Parser<null> {
  return createParser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return !result.success
      ? success(index, null)
      : failure(index);
  }, [parser]);
}

/**
 * cond
 * 
 * @public
*/
export function cond(predicate: (state: any) => boolean): Parser<null> {
  return createParser((_input, index, [], state) => {
    return predicate(state)
      ? success(index, null)
      : failure(index);
  });
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');

/**
 * newline
 * 
 * @public
*/
export const newline = alt([crlf, cr, lf]);

/**
 * sof
 * 
 * @public
*/
export const sof = createParser((_input, index, [], _state) => {
  return index === 0
    ? success(index, null)
    : failure(index);
});

/**
 * eof
 * 
 * @public
*/
export const eof = createParser((input, index, [], _state) => {
  return index >= input.length
    ? success(index, null)
    : failure(index);
});

/**
 * char
 * 
 * @public
*/
export const char = createParser((input, index, [], _state) => {
  if ((input.length - index) < 1) {
    return failure(index);
  }
  const value = input.charAt(index);
  return success(index + 1, value);
});

/**
 * lineBegin
 * 
 * @public
*/
export const lineBegin = createParser((input, index, [], state) => {
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
});

/**
 * lineEnd
 * 
 * @public
*/
export const lineEnd = match(alt([
  eof,
  cr,
  lf,
])).map(() => null);

/**
 * language
 * 
 * @public
*/
export function language<T>(syntaxes: { [K in keyof T]: (r: Record<string, Parser<any>>) => T[K] }): T {
  // TODO: 関数の型宣言をいい感じにしたい
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
