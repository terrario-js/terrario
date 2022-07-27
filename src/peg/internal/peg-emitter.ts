
import * as Ast from './node';

type State = {
	code: string;
};

export function emit(rules: Ast.Rule[]) {
	const state: State = {
		code: ''
	};
	if (rules.length > 0) {
		emitRule(rules[0], state);
		for (let i = 1; i < rules.length; i++) {
			state.code += '\r\n';
			emitRule(rules[i], state);
		}
	}

	return state.code;
}

function emitRule(rule: Ast.Rule, state: State) {
	state.code += rule.name;
	state.code += ' = ';
	emitExpr(rule.expr, state);
}

function emitExpr(expr: Ast.Expr, state: State) {
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

function emitExprIfNeededGroup(node: Ast.Expr, state: State) {
	const needGroup = ((node.type === 'alt' || node.type === 'seq') && node.exprs.length > 1);
	if (needGroup) {
		state.code += '(';
	}
	emitExpr(node, state);
	if (needGroup) {
		state.code += ')';
	}
}

function emitAlt(node: Ast.Alt, state: State) {
	if (node.exprs.length === 0) {
		return;
	}
	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.code += ' / ';
		emitExpr(node.exprs[i], state);
	}
}

function emitSeq(node: Ast.Seq, state: State) {
	if (node.exprs.length === 0) {
		return;
	}
	emitExpr(node.exprs[0], state);
	for (let i = 1; i < node.exprs.length; i++) {
		state.code += ' ';
		emitExpr(node.exprs[i], state);
	}
}

function emitMatchOrNotMatch(node: Ast.Match | Ast.NotMatch, state: State) {
	if (node.type === 'match') {
		state.code += '&';
	} else {
		state.code += '!';
	}
	emitExprIfNeededGroup(node.expr, state);
}

function emitOption(node: Ast.Option, state: State) {
	emitExprIfNeededGroup(node.expr, state);
	state.code += '?';
}

function emitMany(node: Ast.Many, state: State) {
	if (node.min > 1) {
		throw new Error('not supported');
	}
	emitExprIfNeededGroup(node.expr, state);
	if (node.min === 0) {
		state.code += '*';
	} else {
		state.code += '+';
	}
}

function emitStr(node: Ast.Str, state: State) {
	state.code += '"';
	state.code += node.value;
	state.code += '"';
}

function emitRef(node: Ast.Ref, state: State) {
	state.code += node.name;
}
