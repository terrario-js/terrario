import * as T from '../../index';
import * as N from './node';

const space = T.str(/[ \t]/);
const spacing = T.alt([space, T.newline]).many(0);

const lang = T.createLanguage({
  identifier: r => T.seq([
    T.str(/[a-z_]/i),
    T.str(/[a-z0-9_]*/i),
  ]).text(),

  rules: r => {
    const separator = T.seq([
      space.many(0),
      T.newline,
      spacing,
    ]);
    return T.seq([
      T.sep(r.rule as T.Pattern<N.Rule>, separator, 1),
      separator.option(),
    ], 0);
  },

  rule: r => {
    return T.seq([
      r.identifier as T.Pattern<string>,
      spacing,
      T.str('='),
      spacing,
      r.expr as T.Pattern<N.Expr>,
    ]).map(values => {
      return { type: 'rule', name: values[0], expr: values[4] } as N.Rule;
    });
  },

  expr: r => r.expr7,

  expr7: r => {
    // expr1 / expr2
    const separator = T.seq([
      spacing,
      T.str('/'),
      spacing,
    ]);
    const choice = T.sep((r.expr6 as T.Pattern<N.Expr>), separator, 2).map(values => {
      return { type: 'alt', exprs: values } as N.Alt;
    });

    return T.alt([
      choice,
      r.expr6 as T.Pattern<N.Expr>,
    ]);
  },

  // TODO: action expr
  // { /*action*/ }
  expr6: r => r.expr5,

  expr5: r => {
    // expr1 expr2
    const separator = T.alt([space, T.newline]).many(1);
    const sequence = T.sep((r.expr4 as T.Pattern<N.Expr>), separator, 2).map(values => {
      return { type: 'seq', exprs: values } as N.Seq;
    });

    return T.alt([
      sequence,
      r.expr4 as T.Pattern<N.Expr>,
    ]);
  },

  // TODO: @expr label:expr
  expr4: r => r.expr3,

  expr3: r => {
    // $expr &expr !expr
    const op = T.seq([
      T.alt([
        T.str('$').map(v => 'text'),
        T.str('&').map(v => 'match'),
        T.str('!').map(v => 'notMatch'),
      ]),
      spacing,
      r.expr2 as T.Pattern<N.Expr>,
    ]).map(values => {
      return { type: values[0], expr: values[2] } as N.Text | N.Match | N.NotMatch;
    });

    return T.alt([
      op,
      r.expr2 as T.Pattern<N.Expr>,
    ]);
  },

  expr2: r => {
    // expr? expr* expr+
    const op = T.seq([
      r.expr1 as T.Pattern<N.Expr>,
      spacing,
      T.alt([
        T.str('?').map(v => { return { type: 'option' }; }),
        T.str('*').map(v => { return { type: 'many', min: 0 }; }),
        T.str('+').map(v => { return { type: 'many', min: 1 }; }),
      ]),
    ]).map(values => {
      return { ...values[2], expr: values[0] } as N.Option | N.Many;
    });

    return T.alt([
      op,
      r.expr1 as T.Pattern<N.Expr>,
    ]);
  },

  expr1: r => T.alt([
    r.stringLiteral as T.Pattern<N.Str>,
    // r.charRange,
    r.any,
    r.ref as T.Pattern<N.Ref>,
    r.group as T.Pattern<N.Expr>,
  ]),

  stringLiteral: r => T.seq([
    T.str('"'),
    T.char.many(0, T.alt([T.str('"'), T.cr, T.lf])).text(),
    T.str('"'),
  ], 1).map(value => {
    return { type: 'str', value: value } as N.Str;
  }),

  // TODO: charRange [a-z]

  any: r => {
    return T.str('.').map(() => {
      return { type: 'any' };
    });
  },

  ref: r => {
    return T.seq([
      r.identifier as T.Pattern<string>,
      T.notMatch(T.seq([
        spacing,
        T.str('='),
      ])),
    ]).map(values => {
      return { type: 'ref', name: values[0] } as N.Ref;
    });
  },

  group: r => T.seq([
    T.str('('),
    spacing,
    r.expr as T.Pattern<N.Expr>,
    spacing,
    T.str(')'),
  ], 2),
});

export function parse(input: string): N.Rule[] {
  const result = (lang.rules as T.Pattern<N.Rule[]>).parse(input, {});
  if (!result.success) {
    console.log(JSON.stringify(result));
    throw new Error('Parsing error');
  }
  return result.value;
}
