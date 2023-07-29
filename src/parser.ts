import * as T from './index.js';

/**
 * Parser class
 * 
 * @public
*/
export class Parser<U> {
  name?: string;
  ctx: ParserContext<U> | LazyContext<U>;

  /**
   * Parser constructor
   * 
   * @internal
  */
  constructor(opts: StrictParserOpts<U>)
  /**
   * Parser constructor (Lazy parser)
   * 
   * @internal
  */
  constructor(opts: LazyParserOpts<U>)
  constructor(opts: StrictParserOpts<U> | LazyParserOpts<U>) {
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
  _evalContext(): ParserContext<U> {
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
  exec(input: string, state: any = {}, offset: number = 0): Result<U> {
    const ctx = this._evalContext();
    return ctx.handler(input, offset, ctx.children, state);
  }

  /**
   * Parse an input string.
   * 
   * @public
  */
  parse(input: string, state: any = {}): Result<U> {
    const parser = T.seq([this, T.eof], 0);
    return parser.exec(input, state, 0);
  }

  /**
   * Find a pattern from the input string.
   * 
   * @public
  */
  find(input: string, state: any = {}): { index: number, input: string, result: Result<U> } | undefined {
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
  findAll(input: string, state: any = {}): { index: number, input: string, result: Result<U> }[] {
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
  map<V>(fn: (value: U) => V): Parser<V> {
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
  many(min?: number, max?: number): Parser<U[]>
  /**
   * Create a new parser that tries to apply the parser iteratively.
   * 
   * @public
  */
  many(opts: { min?: number, max?: number, notMatch?: Parser<unknown> }): Parser<U[]>
  many(arg1?: number | { min?: number, max?: number, notMatch?: Parser<unknown> }, arg2?: number): Parser<U[]> {
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
  option(): Parser<U | null> {
    return T.alt([
      this,
      T.succeeded(null),
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
  state(key: string, value: (state: any) => any): Parser<U> {
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
export type StrictParserOpts<U> = {
  handler: ParserHandler<U>,
  children?: Parser<any>[],
  name?: string,
  lazy?: undefined,
};

/**
 * @internal
*/
export type LazyParserOpts<U> = {
  lazy: LazyContext<U>,
  name?: string,
  handler?: undefined,
  children?: undefined,
};

/**
 * Type of parser handler
 * 
 * @public
*/
export type ParserHandler<U> = (input: string, index: number, children: Parser<any>[], state: any) => Result<U>;

/**
 * @internal
*/
export type ParserContext<U> = {
  handler: ParserHandler<U>;
  children: Parser<any>[];
};

/**
 * @internal
*/
export type LazyContext<U> =
  () => Parser<U>;

/**
 * Create a custom parser.
 * 
 * @public
*/
function createParser<U>(handler: ParserHandler<U>, children?: Parser<any>[], name?: string): Parser<U> {
  return new Parser({ handler, children, name });
}
export { createParser as parser };

/**
 * Create a lazy parser.
 * 
 * @public
*/
export function lazy<U>(fn: () => Parser<U>, name?: string): Parser<U> {
  return new Parser({ lazy: fn, name });
}

function wrapByTraceHandler<U>(handler: ParserHandler<U>, name?: string): ParserHandler<U> {
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

function many<U>(parser: Parser<U>, opts: { min?: number, max?: number, notMatch?: Parser<unknown> } = {}): Parser<U[]> {
  if (opts.notMatch != null) {
    return many(T.seq([
      T.notMatch(opts.notMatch),
      parser,
    ], 1), { min: opts.min, max: opts.max });
  }
  return createParser((input, index, [child], state) => {
    let result;
    let latestIndex = index;
    const accum: U[] = [];
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
 * Success result type
 * 
 * @public
*/
export type Success<U> = {
  success: true;
  index: number;
  value: U;
};

/**
 * Make a success result.
 * 
 * @public
*/
export function success<U>(index: number, value: U): Success<U> {
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
export type Result<U> = Success<U> | Failure;

/**
 * Get result type of Parser.
 * 
 * @internal
*/
export type ResultType<U> = U extends Parser<infer R> ? R : never;

/**
 * Get result types of Parsers.
 * 
 * @internal
*/
export type ResultTypes<U> = U extends [infer Head, ...infer Tail] ? [ResultType<Head>, ...ResultTypes<Tail>] : [];
