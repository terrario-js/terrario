import * as N from './node';

class State {
  private code: string;
  private depth: number = 0;
  constructor(code: string = '') {
    this.code = code;
  }
  clear() {
    this.code = '';
    this.depth = 0;
  }
  inc() {
    this.depth++;
  }
  dec() {
    this.depth--;
  }
  indent() {
    return '  '.repeat(this.depth);
  }
  write(value: string) {
    this.code += value;
  }
  getCode() {
    return this.code;
  }
}

export function emit(rules: N.Rule[]) {
  const state: State = new State();

  state.write(state.indent() + 'import * as T from \'terrario\';\r\n');
  state.write(state.indent() + 'export const language = T.createLanguage({\r\n');
  emitRules(rules, state);
  state.write(state.indent() + '});');

  return state.getCode();
}

function emitRules(rules: N.Rule[], state: State) {
  if (rules.length === 0) {
    return;
  }
  state.inc();
  emitRule(rules[0], state);
  for (let i = 1; i < rules.length; i++) {
    emitRule(rules[i], state);
  }
  state.dec();
}

function emitRule(rule: N.Rule, state: State) {
  state.write(state.indent() + `${rule.name}: r => {\r\n`);

  state.inc();
  state.write(state.indent() + 'return ');
  emitExpr(rule.expr, state);
  state.write(';\r\n');
  state.dec();

  state.write(state.indent() + '},\r\n');
}

function emitExpr(expr: N.Expr, state: State) {
  switch (expr.type) {
    case 'alt': {
      emitAlt(expr, state);
      break;
    }
    case 'seq': {
      emitSeq(expr, state);
      break;
    }
    case 'text': {
      emitText(expr, state);
      break;
    }
    case 'match':
    case 'notMatch': {
      emitMatchOrNotMatch(expr, state);
      break;
    }
    case 'option': {
      emitOption(expr, state);
      break;
    }
    case 'many': {
      emitMany(expr, state);
      break;
    }
    case 'str': {
      emitStr(expr, state);
      break;
    }
    case 'any': {
      emitChar(state);
      break;
    }
    case 'ref': {
      emitRef(expr, state);
      break;
    }
    default:
      console.log('skipped unknown expr', expr);
      break;
  }
}

function emitAlt(node: N.Alt, state: State) {
  if (node.exprs.length === 0) {
    return;
  }
  state.write('T.alt([\r\n');
  state.inc();
  state.write(state.indent());
  emitExpr(node.exprs[0], state);
  state.write(',');
  for (let i = 1; i < node.exprs.length; i++) {
    state.write('\r\n');
    state.write(state.indent());
    emitExpr(node.exprs[i], state);
    state.write(',');
  }
  state.write('\r\n');
  state.dec();
  state.write(state.indent() + '])');
}

function emitSeq(node: N.Seq, state: State) {
  if (node.exprs.length === 0) {
    return;
  }

  state.write('T.seq([\r\n');
  state.inc();
  state.write(state.indent());
  emitExpr(node.exprs[0], state);
  state.write(',');
  for (let i = 1; i < node.exprs.length; i++) {
    state.write('\r\n');
    state.write(state.indent());
    emitExpr(node.exprs[i], state);
    state.write(',');
  }
  state.write('\r\n');
  state.dec();
  state.write(state.indent() + '])');
}

function emitText(node: N.Text, state: State) {
  emitExpr(node.expr, state);
  state.write('.text()');
}

function emitMatchOrNotMatch(node: N.Match | N.NotMatch, state: State) {
  if (node.type === 'match') {
    state.write('T.match(');
  } else {
    state.write('T.notMatch(');
  }
  emitExpr(node.expr, state);
  state.write(')');
}

function emitOption(node: N.Option, state: State) {
  emitExpr(node.expr, state);
  state.write('.option()');
}

function emitMany(node: N.Many, state: State) {
  emitExpr(node.expr, state);
  state.write(`.many(${node.min})`);
}

function emitStr(node: N.Str, state: State) {
  state.write('T.str(\'');
  state.write(node.value);
  state.write('\')');
}

function emitChar(state: State) {
  state.write('T.char');
}

function emitRef(node: N.Ref, state: State) {
  state.write('r.');
  state.write(node.name);
}
