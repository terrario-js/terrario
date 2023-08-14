import { string as T } from 'terrario';

const spaces = T.str(/[ \t\r\n]/).many();

type JsonValue = null | boolean | string | number | Record<string, unknown> | unknown[];

interface Json {
  root: T.Parser<JsonValue>;
  value: T.Parser<JsonValue>;
  null: T.Parser<null>;
  bool: T.Parser<boolean>;
  string: T.Parser<string>;
  number: T.Parser<number>;
  object: T.Parser<Record<string, JsonValue>>;
  array: T.Parser<JsonValue[]>;
}

const lang = T.language<Json>({
  root: r => T.seq([
    spaces,
    r.value,
    spaces,
  ], 1),

  value: r => T.alt([
    r.null,
    r.bool,
    r.string,
    r.object,
    r.array,
    r.number,
  ]),

  null: r => T.str('null').map(() => null),

  bool: r => T.alt([
    T.str('true'),
    T.str('false'),
  ]).map(value => (value === 'true')),

  string: r => T.seq([
    T.str('"'),
    T.char.many({ notMatch: T.alt([T.str('"'), T.cr, T.lf]) }).text(),
    T.str('"'),
  ], 1),

  number: r => T.alt([
    T.seq([
      T.str(/[+-]/).option(),
      T.str(/[0-9]/).many(1),
      T.seq([
        T.str('.'),
        T.str(/[0-9]/).many(1),
      ]).option(),
    ]).text(),
  ]).map(value => Number(value)),

  object: r => {
    const entry = T.seq([
      r.string,
      spaces,
      T.str(':'),
      spaces,
      r.value,
    ]).map(value => {
      return { key: value[0], value: value[4] };
    });
    const separator = T.seq([
      spaces,
      T.str(','),
      spaces,
    ]);
    return T.seq([
      T.str('{'),
      spaces,
      T.seq([
        entry,
        T.seq([
          separator, entry,
        ], 1).many(),
      ]).map(x => [x[0], ...x[1]]).option(),
      spaces,
      T.str('}'),
    ], 2).map(value => {
      if (value == null) {
        return {};
      }
      const obj: Record<string, JsonValue> = {};
      for (let kvp of value) {
        obj[kvp.key] = kvp.value;
      }
      return obj;
    });
  },

  array: r => {
    const separator = T.seq([
      spaces,
      T.str(','),
      spaces,
    ]);
    return T.seq([
      T.str('['),
      spaces,
      T.seq([
        r.value,
        T.seq([
          separator,
          r.value,
        ], 1).many(),
      ]).map(x => [x[0], ...x[1]]).option(),
      spaces,
      T.str(']'),
    ], 2).map(value => {
      return (value != null ? value : []);
    });
  },
});

export function parse(input: string) {
  const result = lang.root.parse(input);
  if (!result.success) {
    throw new Error(`failed to parse JSON. (index=${result.index})`);
  }
  return result.value;
}
