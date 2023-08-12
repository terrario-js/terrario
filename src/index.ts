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
  exec(input: string, state: Record<string, any> = {}, offset: number = 0): Result<U> {
    const ctx = this._evalContext();
    return ctx.handler(input, offset, ctx.children, state);
  }

  /**
   * Parse an input string.
   * 
   * @public
  */
  parse(input: string, state: any = {}): Result<U> {
    const parser = seq([this, eof], 0);
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
    }, [this], 'map');
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
    }, [this], 'text');
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
  state(key: string, value: (state: any) => any): Parser<U> {
    return createParser((input, index, [child], state) => {
      const storedValue = state[key];
      state[key] = value(state);
      const result = child.exec(input, state, index);
      state[key] = storedValue;
      return result;
    }, [this], 'state');
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

function wrapByTraceHandler<U>(handler: ParserHandler<U>, name?: string): ParserHandler<U> {
  return (input, index, children, state) => {
    if (state.trace) {
      const internalName = name != null ? name : '<unnamed>';
      const pos = `${index}`;
      console.log(`${pos.padEnd(6, ' ')}enter ${internalName}`);
      const result = handler(input, index, children, state);
      if (result.success) {
        const pos = `${index}:${result.index}`;
        console.log(`${pos.padEnd(6, ' ')}success ${internalName}`);
      } else {
        const pos = `${index}`;
        console.log(`${pos.padEnd(6, ' ')}failure ${internalName}`);
      }
      return result;
    }
    return handler(input, index, children, state);
  };
}

function many<U>(parser: Parser<U>, opts: { min?: number, max?: number, notMatch?: Parser<unknown> } = {}): Parser<U[]> {
  if (opts.notMatch != null) {
    return many(seq([
      notMatch(opts.notMatch),
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
  }, [parser], 'many');
}

/**
 * Create a new parser that matches the given string.
 * 
 * @public
*/
export function str<U extends string>(value: U): Parser<U>
/**
 * Create a new parser that matches the given regular expression.
 * 
 * @public
*/
export function str(pattern: RegExp): Parser<string>
export function str(value: string | RegExp): Parser<string> {
  return (typeof value === 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<U extends string>(value: U): Parser<U> {
  return createParser((input, index, [], _state) => {
    if ((input.length - index) < value.length) {
      return failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return failure(index);
    }
    return success(index + value.length, value);
  }, undefined, 'str');
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
  }, undefined, 'str');
}

/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
*/
export function seq<U extends Parser<any>[]>(parsers: [...U]): Parser<ResultTypes<[...U]>>
/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
 * @param select - The index of the data returned in the result.
*/
export function seq<U extends Parser<any>[], V extends number>(parsers: [...U], select: V): U[V]
export function seq(parsers: Parser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<U extends Parser<any>[]>(parsers: [...U]): Parser<ResultTypes<[...U]>> {
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
    return success(latestIndex, (accum as ResultTypes<[...U]>));
  }, parsers, 'seq');
}

function seqSelect<U extends Parser<any>[], V extends number>(parsers: [...U], select: V): U[V] {
  return seqAll(parsers).map(values => values[select]);
}

/**
 * alt
 * 
 * @public
*/
export function alt<U extends Parser<unknown>[]>(parsers: [...U]): Parser<ResultTypes<U>[number]> {
  return createParser((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, state, index) as Result<ResultTypes<U>[number]>;
      if (result.success) {
        return result;
      }
    }
    return failure(index);
  }, parsers, 'alt');
}

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

/**
 * Create a new parser that already succeeds.
 * 
 * @public
*/
export function succeeded<U>(value: U): Parser<U> {
  return createParser((_input, index, [], _state) => {
    return success(index, value);
  }, undefined, 'succeeded');
}

/**
 * match
 * 
 * @public
*/
export function match<U>(parser: Parser<U>): Parser<U> {
  return createParser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, [parser], 'match');
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
  }, [parser], 'notMatch');
}

/**
 * where
 * 
 * @public
*/
export function where<U>(condition: (state: any) => boolean, parser: Parser<U>): Parser<U> {
  return createParser((input, index, [child], state) => {
    return condition(state)
      ? child.exec(input, state, index)
      : failure(index);
  }, [parser], 'where');
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
 * Match the begin of the input string.
 * 
 * @public
*/
export const sof = createParser((_input, index, [], _state) => {
  return index === 0
    ? success(index, null)
    : failure(index);
}, undefined, 'sof');

/**
 * Match the end of the input string.
 * 
 * @public
*/
export const eof = createParser((input, index, [], _state) => {
  return index >= input.length
    ? success(index, null)
    : failure(index);
}, undefined, 'eof');

/**
 * any char
 * 
 * @public
*/
export const char = createParser((input, index, [], _state) => {
  if ((input.length - index) < 1) {
    return failure(index);
  }
  const value = input.charAt(index);
  return success(index + 1, value);
}, undefined, 'char');

/**
 * Match lineBegin
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
}, undefined, 'lineBegin');

/**
 * Match lineEnd
 * 
 * @public
*/
export const lineEnd = match(alt([
  eof,
  cr,
  lf,
])).map(() => null);

/**
 * Create a language
 * 
 * @public
*/
export function language<U extends Language<U>>(source: LanguageSource<U>): U {
  const lang: Record<string, Parser<any>> = {};
  for (const key of Object.keys(source)) {
    lang[key] = lazy(() => {
      const parser = (source as any)[key](lang);
      if (parser == null || !(parser instanceof Parser)) {
        throw new Error('syntax must return a Parser.');
      }
      parser.name = key;
      return parser;
    });
  }
  return lang as any;
}

/**
 * A type must be a language object.
 * 
 * @public
*/
export type Language<U> = {[K in keyof U]: U[K] extends Parser<unknown> ? U[K] : never };

/**
 * Language source
 * 
 * @public
*/
export type LanguageSource<U extends Language<U>> = { [K in keyof U]: (lang: U) => U[K] };

export {
  prattConfig,
  PrattConfig,
  OperatorGroup,
} from './expr.js';
