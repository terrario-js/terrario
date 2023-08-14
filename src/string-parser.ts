import { success, failure, Result } from './result.js';

/**
 * String Parser
 * 
 * @public
*/
export class StringParser<U> {
  tag: string;
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
    this.tag = opts.tag ?? '';
    if (opts.handler != null) {
      this.ctx = {
        kind: 'strict',
        handler: wrapByTraceHandler(opts.handler, this.tag),
      };
    } else {
      this.ctx = { kind: 'lazy', handler: opts.lazy };
    }
  }

  /**
   * Evaluate the lazy context.
   * 
   * @internal
  */
  _evalContext(): ParserContext<U> {
    if (this.ctx.kind === 'lazy') {
      const parser = this.ctx.handler();
      const ctx = parser._evalContext();
      this.ctx = {
        kind: 'strict',
        handler: wrapByTraceHandler(ctx.handler, this.tag),
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
    return ctx.handler(input, offset, state);
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
  map<V>(fn: (value: U) => V): StringParser<V> {
    return createParser((input, index, state) => {
      const result = this.exec(input, state, index);
      if (!result.success) {
        return result;
      }
      return success(result.index, fn(result.value));
    }, 'map');
  }

  /**
   * Create a new parser that tries to apply the parser iteratively.
   * 
   * @public
  */
  many(min?: number, max?: number): StringParser<U[]>
  /**
   * Create a new parser that tries to apply the parser iteratively.
   * 
   * @public
  */
  many(opts: { min?: number, max?: number, notMatch?: StringParser<unknown> }): StringParser<U[]>
  many(arg1?: number | { min?: number, max?: number, notMatch?: StringParser<unknown> }, arg2?: number): StringParser<U[]> {
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
  option(): StringParser<U | null> {
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
  state(key: string, value: (state: any) => any): StringParser<U> {
    return createParser((input, index, state) => {
      const storedValue = state[key];
      state[key] = value(state);
      const result = this.exec(input, state, index);
      state[key] = storedValue;
      return result;
    }, 'state');
  }

  /**
   * Create a new parser that wraps the current parser.
   * The generated parser will return the text in the range matched by the inner parser.
   * 
   * @public
  */
  text(): StringParser<string> {
    return createParser((input, index, state) => {
      const result = this.exec(input, state, index);
      if (!result.success) {
        return result;
      }
      const text = input.slice(index, result.index);
      return success(result.index, text);
    }, 'text');
  }
}

/**
 * @internal
*/
export type StrictParserOpts<U> = {
  handler: ParserHandler<U>,
  tag?: string,
  lazy?: undefined,
};

/**
 * @internal
*/
export type LazyParserOpts<U> = {
  lazy: () => StringParser<U>,
  tag?: string,
  handler?: undefined,
};

/**
 * Type of parser handler
 * 
 * @public
*/
export type ParserHandler<U> = (input: string, index: number, state: any) => Result<U>;

/**
 * @internal
*/
export type ParserContext<U> = {
  kind: 'strict',
  handler: ParserHandler<U>,
};

/**
 * @internal
*/
export type LazyContext<U> = {
  kind: 'lazy',
  handler: () => StringParser<U>,
};

/**
 * Get result type of Parser.
 * 
 * @internal
*/
export type ResultType<U> = U extends StringParser<infer R> ? R : never;

/**
 * Get result types of Parsers.
 * 
 * @internal
*/
export type ResultTypes<U> = U extends [infer Head, ...infer Tail] ? [ResultType<Head>, ...ResultTypes<Tail>] : [];

function wrapByTraceHandler<U>(handler: ParserHandler<U>, tag: string): ParserHandler<U> {
  return (input, index, state) => {
    if (state.trace) {
      const pos = `${index}`;
      console.log(`${pos.padEnd(6, ' ')}enter ${tag}`);
      const result = handler(input, index, state);
      if (result.success) {
        const pos = `${index}:${result.index}`;
        console.log(`${pos.padEnd(6, ' ')}success ${tag}`);
      } else {
        const pos = `${index}`;
        console.log(`${pos.padEnd(6, ' ')}failure ${tag}`);
      }
      return result;
    }
    return handler(input, index, state);
  };
}

function many<U>(parser: StringParser<U>, opts: { min?: number, max?: number, notMatch?: StringParser<unknown> } = {}): StringParser<U[]> {
  if (opts.notMatch != null) {
    return many(seq([
      notMatch(opts.notMatch),
      parser,
    ], 1), { min: opts.min, max: opts.max });
  }
  return createParser((input, index, state) => {
    let result;
    let latestIndex = index;
    const accum: U[] = [];
    while (latestIndex < input.length) {
      result = parser.exec(input, state, latestIndex);
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
  }, 'many');
}

/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
*/
export function seq<U extends StringParser<any>[]>(parsers: [...U]): StringParser<ResultTypes<[...U]>>
/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
 * @param select - The index of the data returned in the result.
*/
export function seq<U extends StringParser<any>[], V extends number>(parsers: [...U], select: V): U[V]
export function seq(parsers: StringParser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<U extends StringParser<any>[]>(parsers: [...U]): StringParser<ResultTypes<[...U]>> {
  return createParser((input, index, state) => {
    let result;
    let latestIndex = index;
    const accum = [];
    for (let i = 0; i < parsers.length; i++) {
      result = parsers[i].exec(input, state, latestIndex);
      if (!result.success) {
        return result;
      }
      latestIndex = result.index;
      accum.push(result.value);
    }
    return success(latestIndex, (accum as ResultTypes<[...U]>));
  }, `seq length=${parsers.length}`);
}

function seqSelect<U extends StringParser<any>[], V extends number>(parsers: [...U], select: V): U[V] {
  return seqAll(parsers).map(values => values[select]);
}

/**
 * alt
 * 
 * @public
*/
export function alt<U extends StringParser<unknown>[]>(parsers: [...U]): StringParser<ResultTypes<U>[number]> {
  return createParser((input, index, state) => {
    let result;
    for (let i = 0; i < parsers.length; i++) {
      result = parsers[i].exec(input, state, index) as Result<ResultTypes<U>[number]>;
      if (result.success) {
        return result;
      }
    }
    return failure(index);
  }, `alt length=${parsers.length}`);
}

/**
 * Create a custom parser.
 * 
 * @public
*/
function createParser<U>(handler: ParserHandler<U>, tag?: string): StringParser<U> {
  return new StringParser({ handler, tag });
}
export { createParser as parser };

/**
 * Create a lazy parser.
 * 
 * @public
*/
export function lazy<U>(fn: () => StringParser<U>, tag?: string): StringParser<U> {
  return new StringParser({ lazy: fn, tag });
}

/**
 * Create a new parser that already succeeds.
 * 
 * @public
*/
export function succeeded<U>(value: U): StringParser<U> {
  return createParser((_input, index, _state) => {
    return success(index, value);
  }, 'succeeded');
}

/**
 * match
 * 
 * @public
*/
export function match<U>(parser: StringParser<U>): StringParser<U> {
  return createParser((input, index, state) => {
    const result = parser.exec(input, state, index);
    return result.success
      ? success(index, result.value)
      : failure(index);
  }, 'match');
}

/**
 * notMatch
 * 
 * @public
*/
export function notMatch(parser: StringParser<unknown>): StringParser<null> {
  return createParser((input, index, state) => {
    const result = parser.exec(input, state, index);
    return !result.success
      ? success(index, null)
      : failure(index);
  }, 'notMatch');
}

/**
 * where
 * 
 * @public
*/
export function where<U>(condition: (state: any) => boolean, parser: StringParser<U>): StringParser<U> {
  return createParser((input, index, state) => {
    return condition(state)
      ? parser.exec(input, state, index)
      : failure(index);
  }, 'where');
}

/**
 * Match the begin of the input string.
 * 
 * @public
*/
export const sof = createParser((_input, index, _state) => {
  return index === 0
    ? success(index, null)
    : failure(index);
}, 'sof');

/**
 * Match the end of the input string.
 * 
 * @public
*/
export const eof = createParser((input, index, _state) => {
  return index >= input.length
    ? success(index, null)
    : failure(index);
}, 'eof');

/**
 * Create a language
 * 
 * @public
*/
export function language<U extends Language<U>>(source: LanguageSource<U>): U {
  const lang: Record<string, StringParser<any>> = {};
  for (const key of Object.keys(source)) {
    lang[key] = lazy(() => {
      const parser = (source as any)[key](lang);
      if (parser == null || !(parser instanceof StringParser)) {
        throw new Error('syntax must return a Parser.');
      }
      parser.tag = `${parser.tag} key=${key}`;
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
export type Language<U> = {[K in keyof U]: U[K] extends StringParser<unknown> ? U[K] : never };

/**
 * Language source
 * 
 * @public
*/
export type LanguageSource<U extends Language<U>> = { [K in keyof U]: (lang: U) => U[K] };




/**
 * Create a new parser that matches the given string.
 * 
 * @public
*/
export function str<U extends string>(value: U): StringParser<U>
/**
 * Create a new parser that matches the given regular expression.
 * 
 * @public
*/
export function str(pattern: RegExp): StringParser<string>
export function str(value: string | RegExp): StringParser<string> {
  return (typeof value === 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<U extends string>(value: U): StringParser<U> {
  return createParser((input, index, _state) => {
    if ((input.length - index) < value.length) {
      return failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return failure(index);
    }
    return success(index + value.length, value);
  }, `str value=${value}`);
}

function strWithRegExp(pattern: RegExp): StringParser<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return createParser((input, index, _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return failure(index);
    }
    return success(index + result[0].length, result[0]);
  }, `str pattern=${pattern}`);
}

/**
 * any char
 * 
 * @public
*/
export const char = createParser((input, index, _state) => {
  if ((input.length - index) < 1) {
    return failure(index);
  }
  const value = input.charAt(index);
  return success(index + 1, value);
}, 'char');


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
 * Match lineBegin
 * 
 * @public
*/
export const lineBegin = createParser((input, index, state) => {
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
}, 'lineBegin');

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
