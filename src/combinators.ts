import * as T from './index.js';

/**
 * Create a new parser that matches the given string.
 * 
 * @public
*/
export function str<U extends string>(value: U): T.Parser<U>
/**
 * Create a new parser that matches the given regular expression.
 * 
 * @public
*/
export function str(pattern: RegExp): T.Parser<string>
export function str(value: string | RegExp): T.Parser<string> {
  return (typeof value === 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<U extends string>(value: U): T.Parser<U> {
  return T.parser((input, index, [], _state) => {
    if ((input.length - index) < value.length) {
      return T.failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return T.failure(index);
    }
    return T.success(index + value.length, value);
  });
}

function strWithRegExp(pattern: RegExp): T.Parser<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return T.parser((input, index, [], _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return T.failure(index);
    }
    return T.success(index + result[0].length, result[0]);
  });
}

/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
*/
export function seq<U extends T.Parser<any>[]>(parsers: [...U]): T.Parser<T.ResultTypes<[...U]>>
/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
 * @param select - The index of the data returned in the result.
*/
export function seq<U extends T.Parser<any>[], V extends number>(parsers: [...U], select: V): U[V]
export function seq(parsers: T.Parser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<U extends T.Parser<any>[]>(parsers: [...U]): T.Parser<T.ResultTypes<[...U]>> {
  return T.parser((input, index, children, state) => {
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
    return T.success(latestIndex, (accum as T.ResultTypes<[...U]>));
  }, parsers);
}

function seqSelect<U extends T.Parser<any>[], V extends number>(parsers: [...U], select: V): U[V] {
  return seqAll(parsers).map(values => values[select]);
}

/**
 * alt
 * 
 * @public
*/
export function alt<U extends T.Parser<unknown>[]>(parsers: [...U]): T.Parser<T.ResultTypes<U>[number]> {
  return T.parser((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, state, index) as T.Result<T.ResultTypes<U>[number]>;
      if (result.success) {
        return result;
      }
    }
    return T.failure(index);
  }, parsers);
}

/**
 * Create a new parser that already succeeds.
 * 
 * @public
*/
export function succeeded<U>(value: U): T.Parser<U> {
  return T.parser((_input, index, [], _state) => {
    return T.success(index, value);
  });
}

/**
 * match
 * 
 * @public
*/
export function match<U>(parser: T.Parser<U>): T.Parser<U> {
  return T.parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return result.success
      ? T.success(index, result.value)
      : T.failure(index);
  }, [parser]);
}

/**
 * notMatch
 * 
 * @public
*/
export function notMatch(parser: T.Parser<unknown>): T.Parser<null> {
  return T.parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return !result.success
      ? T.success(index, null)
      : T.failure(index);
  }, [parser]);
}

/**
 * where
 * 
 * @public
*/
export function where<U>(condition: (state: any) => boolean, parser: T.Parser<U>): T.Parser<U> {
  return T.parser((input, index, [child], state) => {
    return condition(state)
      ? child.exec(input, state, index)
      : T.failure(index);
  }, [parser]);
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
export const sof = T.parser((_input, index, [], _state) => {
  return index === 0
    ? T.success(index, null)
    : T.failure(index);
});

/**
 * Match the end of the input string.
 * 
 * @public
*/
export const eof = T.parser((input, index, [], _state) => {
  return index >= input.length
    ? T.success(index, null)
    : T.failure(index);
});

/**
 * any char
 * 
 * @public
*/
export const char = T.parser((input, index, [], _state) => {
  if ((input.length - index) < 1) {
    return T.failure(index);
  }
  const value = input.charAt(index);
  return T.success(index + 1, value);
});

/**
 * Match lineBegin
 * 
 * @public
*/
export const lineBegin = T.parser((input, index, [], state) => {
  if (sof.exec(input, state, index).success) {
    return T.success(index, null);
  }
  if (cr.exec(input, state, index - 1).success) {
    return T.success(index, null);
  }
  if (lf.exec(input, state, index - 1).success) {
    return T.success(index, null);
  }
  return T.failure(index);
});

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
