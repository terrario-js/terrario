import * as N from './node';

type State = {
	code: string;
};

export function emit(rules: N.Rule[]) {
	const state: State = {
		code: ''
	};

	state.code += 'import * as P from \'terrario\';\r\n';
	state.code += 'export const language = P.createLanguage({\r\n';

	emitRules(rules, state);

	state.code += '});\r\n';

	return state.code;
}

function emitRules(rules: N.Rule[], state: State) {
	if (rules.length === 0) {
		return;
	}
	emitRule(rules[0], state);
	for (let i = 1; i < rules.length; i++) {
		emitRule(rules[i], state);
	}
}

function emitRule(rule: N.Rule, state: State) {
	state.code += `${rule.name}: r => { return `;
	emitExpr(rule.expr, state);
	state.code += '; },\r\n';
}

function emitExpr(expr: N.Expr, state: State) {
	switch (expr.type) {
		case 'alt': {
			emitAlt(expr, state);
			return;
		}
		case 'seq': {
			emitSeq(expr, state);
			return;
		}
		case 'match':
		case 'notMatch': {
			emitMatchOrNotMatch(expr, state);
			return;
		}
		case 'option': {
			emitOption(expr, state);
			return;
		}
		case 'many': {
			emitMany(expr, state);
			return;
		}
		case 'str': {
			emitStr(expr, state);
			return;
		}
		case 'ref': {
			emitRef(expr, state);
			return;
		}
	}
	console.log('skipped unknown expr', expr);
}

function emitAlt(node: N.Alt, state: State) {
	if (node.exprs.length === 0) {
		return;
	}
	state.code += 'P.alt([';
	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.code += ', ';
		emitExpr(node.exprs[i], state);
	}
	state.code += '])';
}

function emitSeq(node: N.Seq, state: State) {
	if (node.exprs.length === 0) {
		return;
	}
	state.code += 'P.seq([';
	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.code += ', ';
		emitExpr(node.exprs[i], state);
	}
	state.code += '])';
}

function emitMatchOrNotMatch(node: N.Match | N.NotMatch, state: State) {
	if (node.type === 'match') {
		state.code += 'P.match(';
	} else {
		state.code += 'P.notMatch(';
	}
	emitExpr(node.expr, state);
	state.code += ')';
}

function emitOption(node: N.Option, state: State) {
	emitExpr(node.expr, state);
	state.code += '.option()';
}

function emitMany(node: N.Many, state: State) {
	emitExpr(node.expr, state);
	state.code += `.many(${node.min})`;
}

function emitStr(node: N.Str, state: State) {
	state.code += 'P.str(\'';
	state.code += node.value;
	state.code += '\')';
}

function emitRef(node: N.Ref, state: State) {
	state.code += 'r.';
	state.code += node.name;
}
