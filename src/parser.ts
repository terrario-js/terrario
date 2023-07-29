import * as Api from './index.js';

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
    const parser = Api.seq([this, Api.eof], 0);
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
    return Api.alt([
      this,
      Api.succeeded(null),
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
    return many(Api.seq([
      Api.notMatch(opts.notMatch),
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
