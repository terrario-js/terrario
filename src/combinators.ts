import * as Api from './index.js';

/**
 * Create a new parser that matches the given string.
 * 
 * @public
*/
export function str<T extends string>(value: T): Api.Parser<T>
/**
 * Create a new parser that matches the given regular expression.
 * 
 * @public
*/
export function str(pattern: RegExp): Api.Parser<string>
export function str(value: string | RegExp): Api.Parser<string> {
  return (typeof value === 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<T extends string>(value: T): Api.Parser<T> {
  return Api.parser((input, index, [], _state) => {
    if ((input.length - index) < value.length) {
      return Api.failure(index);
    }
    if (input.slice(index, index + value.length) !== value) {
      return Api.failure(index);
    }
    return Api.success(index + value.length, value);
  });
}

function strWithRegExp(pattern: RegExp): Api.Parser<string> {
  const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
  return Api.parser((input, index, [], _state) => {
    const text = input.slice(index);
    const result = re.exec(text);
    if (result == null) {
      return Api.failure(index);
    }
    return Api.success(index + result[0].length, result[0]);
  });
}

/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
*/
export function seq<T extends Api.Parser<any>[]>(parsers: [...T]): Api.Parser<Api.ResultTypes<[...T]>>
/**
 * Create a new parser that sequentially applies an array of parser.
 * 
 * @public
 * @param select The index of the data returned in the result.
*/
export function seq<T extends Api.Parser<any>[], U extends number>(parsers: [...T], select: U): T[U]
export function seq(parsers: Api.Parser<any>[], select?: number) {
  return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<T extends Api.Parser<any>[]>(parsers: [...T]): Api.Parser<Api.ResultTypes<[...T]>> {
  return Api.parser((input, index, children, state) => {
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
    return Api.success(latestIndex, (accum as Api.ResultTypes<[...T]>));
  }, parsers);
}

function seqSelect<T extends Api.Parser<any>[], U extends number>(parsers: [...T], select: U): T[U] {
  return seqAll(parsers).map(values => values[select]);
}

/**
 * alt
 * 
 * @public
*/
export function alt<T extends Api.Parser<unknown>[]>(parsers: [...T]): Api.Parser<Api.ResultTypes<T>[number]> {
  return Api.parser((input, index, children, state) => {
    let result;
    for (let i = 0; i < children.length; i++) {
      result = children[i].exec(input, state, index) as Api.Result<Api.ResultTypes<T>[number]>;
      if (result.success) {
        return result;
      }
    }
    return Api.failure(index);
  }, parsers);
}

/**
 * Create a new parser that already succeeds.
 * 
 * @public
*/
export function succeeded<T>(value: T): Api.Parser<T> {
  return Api.parser((_input, index, [], _state) => {
    return Api.success(index, value);
  });
}

/**
 * match
 * 
 * @public
*/
export function match<T>(parser: Api.Parser<T>): Api.Parser<T> {
  return Api.parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return result.success
      ? Api.success(index, result.value)
      : Api.failure(index);
  }, [parser]);
}

/**
 * notMatch
 * 
 * @public
*/
export function notMatch(parser: Api.Parser<unknown>): Api.Parser<null> {
  return Api.parser((input, index, [child], state) => {
    const result = child.exec(input, state, index);
    return !result.success
      ? Api.success(index, null)
      : Api.failure(index);
  }, [parser]);
}

/**
 * where
 * 
 * @public
*/
export function where<T>(condition: (state: any) => boolean, parser: Api.Parser<T>): Api.Parser<T> {
  return Api.parser((input, index, [child], state) => {
    return condition(state)
      ? child.exec(input, state, index)
      : Api.failure(index);
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
export const sof = Api.parser((_input, index, [], _state) => {
  return index === 0
    ? Api.success(index, null)
    : Api.failure(index);
});

/**
 * Match the end of the input string.
 * 
 * @public
*/
export const eof = Api.parser((input, index, [], _state) => {
  return index >= input.length
    ? Api.success(index, null)
    : Api.failure(index);
});

/**
 * any char
 * 
 * @public
*/
export const char = Api.parser((input, index, [], _state) => {
  if ((input.length - index) < 1) {
    return Api.failure(index);
  }
  const value = input.charAt(index);
  return Api.success(index + 1, value);
});

/**
 * Match lineBegin
 * 
 * @public
*/
export const lineBegin = Api.parser((input, index, [], state) => {
  if (sof.exec(input, state, index).success) {
    return Api.success(index, null);
  }
  if (cr.exec(input, state, index - 1).success) {
    return Api.success(index, null);
  }
  if (lf.exec(input, state, index - 1).success) {
    return Api.success(index, null);
  }
  return Api.failure(index);
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
