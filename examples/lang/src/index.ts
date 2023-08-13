import * as T from 'terrario';

type Operator =
  | { kind: 'add', left: Expr, right: Expr }
  | { kind: 'sub', left: Expr, right: Expr }
  | { kind: 'mul', left: Expr, right: Expr }
  | { kind: 'div', left: Expr, right: Expr }
  | { kind: 'mod', left: Expr, right: Expr };

type Expr = { kind: 'number', value: number } | Operator;
type Statement = { kind: 'expr', expr: Expr };

interface Lang {
  root: T.Parser<Statement[]>;
  statement: T.Parser<Statement>;
  statements: T.Parser<Statement[]>;
  expr: T.Parser<Expr>;
  number: T.Parser<Expr>;
}

const spaces = T.str(/[ \t\r\n]/).many();
const digit0 = T.str(/[0-9]/);
const digit1 = T.str(/[1-9]/);

const lang = T.language<Lang>({
  root: r => T.seq([
    spaces,
    r.statements,
    spaces,
  ], 1),

  statements: r => T.seq([
    r.statement,
    T.seq([
      spaces,
      r.statement,
    ], 1).many(),
  ]).map(([head, tails]) => [head, ...tails]),

  statement: r => T.alt([
    T.seq([
      r.expr,
      T.str(';'),
    ], 0).map(x => ({ kind: 'expr', expr: x } as Statement)),
  ]),

  expr: r => {
    function op(op: string): T.Parser<any> {
      return T.seq([
        spaces,
        T.str(op),
        spaces,
      ]);
    }
    const config = T.prattConfig<Expr, Operator>();
    config.setAtom(T.alt([
      r.number,
    ]));
    config.addOperatorGroup()
      .addInfix(op('*'), 'left', (_op, left, right) => ({ kind: 'mul', left, right }))
      .addInfix(op('/'), 'left', (_op, left, right) => ({ kind: 'div', left, right }))
      .addInfix(op('%'), 'left', (_op, left, right) => ({ kind: 'mod', left, right }));
    config.addOperatorGroup()
      .addInfix(op('+'), 'left', (_op, left, right) => ({ kind: 'add', left, right }))
      .addInfix(op('-'), 'left', (_op, left, right) => ({ kind: 'sub', left, right }));
    return config.build();
  },

  number: r => T.alt([
    T.seq([
      digit1,
      digit0.many(1),
    ]).text(),
    digit0,
  ]).map(x => ({ kind: 'number', value: Number(x) })),
});

export function parse(input: string) {
  const result = lang.root.parse(input, { trace: true });
  if (!result.success) {
    throw new Error(`syntax error. (index=${result.index})`);
  }
  return result.value;
}
