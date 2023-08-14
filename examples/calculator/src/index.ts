import * as T from 'terrario';
import { Operator, buildPrattParser } from './pratt.js';

type Expr = { kind: 'number', value: number } | Operator<Expr>;

interface Lang {
  root: T.Parser<Expr>;
  expr: T.Parser<Expr>;
  number: T.Parser<Expr>;
}

const spaces = T.str(/[ \t\r\n]/).many();

const lang = T.language<Lang>({
  root: r => T.seq([
    spaces,
    r.expr,
    spaces,
  ], 1),

  expr: r => {
    const atom = T.seq([
      spaces,
      T.alt([
        r.number,
      ]),
      spaces,
    ], 1);
    const pratt = buildPrattParser(atom);
    return pratt;
  },

  number: r => {
    const digit0 = T.str(/[0-9]/);
    const digit1 = T.str(/[1-9]/);
    return T.alt([
      T.seq([
        digit1,
        digit0.many(1),
      ]).text(),
      digit0,
    ]).map(x => ({ kind: 'number', value: Number(x) }));
  },
});

function parse(input: string) {
  const result = lang.root.parse(input);
  if (!result.success) {
    throw new Error(`syntax error. (index=${result.index})`);
  }
  return result.value;
}

export function evaluate(expr: Expr): number {
  switch (expr.kind) {
    case 'number': {
      return expr.value;
    }
    case 'pow': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return Math.pow(left, right);
    }
    case 'plus': {
      const value = evaluate(expr.exprs[0]);
      return value;
    }
    case 'minus': {
      const value = evaluate(expr.exprs[0]);
      return -value;
    }
    case 'mul': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return left * right;
    }
    case 'div': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return left / right;
    }
    case 'mod': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return left % right;
    }
    case 'add': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return left + right;
    }
    case 'sub': {
      const left = evaluate(expr.exprs[0]);
      const right = evaluate(expr.exprs[1]);
      return left - right;
    }
    default: {
      throw new Error('unknown operator: ' + (expr as any).kind);
    }
  }
}

export function calculator(input: string): number {
  const expr = parse(input);
  const result = evaluate(expr);
  return result;
}
