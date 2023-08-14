import { token as T } from 'terrario';
import { Operator, buildPrattParser } from './pratt.js';

type Expr = { kind: 'number', value: number } | Operator<Expr>;

interface Lang {
  root: T.Parser<Expr>;
  expr: T.Parser<Expr>;
  number: T.Parser<Expr>;
}

const spaces = T.token(/[ \t\r\n]/).many();

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
    const digit0 = T.token(/[0-9]/);
    const digit1 = T.token(/[1-9]/);
    return T.alt([
      T.seq([
        digit1,
        digit0.many(1),
      ]).map(([x, y]) => ([x, ...y].join(''))),
      digit0,
    ]).map(x => ({ kind: 'number', value: Number(x) }));
  },
});

function parse(input: string[]): Expr {
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

const digitRegexp = /^[0-9]$/;

function scan(input: string): string[] {
  const tokens: string[] = [];
  let index = 0;
  while (index < input.length) {
    switch (input[index]) {
      case ' ':
      case '\t':
      case '\r':
      case '\n': {
        index += 1;
        continue;
      }
      case '*': {
        index += 1;
        if (input[index] == '*') {
          index += 1;
          tokens.push('**');
        } else {
          tokens.push('*');
        }
        continue;
      }
      case '/': {
        index += 1;
        tokens.push('/');
        continue;
      }
      case '+': {
        index += 1;
        tokens.push('+');
        continue;
      }
      case '-': {
        index += 1;
        tokens.push('-');
        continue;
      }
      case '%': {
        index += 1;
        tokens.push('%');
        continue;
      }
    }
    // digit
    if (digitRegexp.test(input[index])) {
      tokens.push(input[index]);
      index += 1;
      continue;
    }
    throw new Error('invalid token');
  }
  return tokens;
}

export function calculator(input: string): number {
  const tokens = scan(input);
  const expr = parse(tokens);
  const result = evaluate(expr);
  return result;
}
