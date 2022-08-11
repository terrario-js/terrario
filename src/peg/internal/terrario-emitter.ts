import * as N from './node';

class State {
	code: string;
	indentLevel: number = 0;
	constructor(code: string = '') {
		this.code = code;
	}
	clear() {
		this.code = '';
		this.indentLevel = 0;
	}
	downIndent() {
		this.indentLevel++;
	}
	upIndent() {
		this.indentLevel--;
	}
	writeIndent() {
		this.code += '  '.repeat(this.indentLevel);
	}
	write(value: string) {
		this.code += value;
	}
}

export function emit(rules: N.Rule[]) {
	const state: State = new State();

	state.writeIndent(); state.write('import * as T from \'terrario\';\r\n');
	state.writeIndent(); state.write('export const language = T.createLanguage({');
	emitRules(rules, state);
	state.writeIndent(); state.write('});');

	return state.code;
}

function emitRules(rules: N.Rule[], state: State) {
	if (rules.length === 0) {
		return;
	}

	state.write('\r\n');
	state.downIndent();

	emitRule(rules[0], state);
	for (let i = 1; i < rules.length; i++) {
		state.write('\r\n');
		emitRule(rules[i], state);
	}

	state.upIndent();
	state.write('\r\n');
}

function emitRule(rule: N.Rule, state: State) {
	state.writeIndent(); state.write(`${rule.name}: r => {`);

	state.downIndent();
	state.write('\r\n');
	state.writeIndent(); state.write('return ');

	emitExpr(rule.expr, state);

	state.write(';\r\n');
	state.upIndent();

	state.writeIndent(); state.write('},');
}

function emitExpr(expr: N.PegExpr, state: State) {
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
	state.write('T.alt([');
	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.write(', ');
		emitExpr(node.exprs[i], state);
	}
	state.write('])');
}

function emitSeq(node: N.Seq, state: State) {
	if (node.exprs.length === 0) {
		return;
	}

	state.write('T.seq([');

	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.write(', ');
		emitExpr(node.exprs[i], state);
	}

	state.write('])');
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
