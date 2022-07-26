
import * as Ast from './node';

type State = {
	code: string;
};

export function emit(rules: Ast.Rule[]) {
	const state: State = {
		code: ''
	};

	for (let rule of rules) {
		emitRule(rule, state);
	}

	return state.code;
}

function emitRule(rule: Ast.Rule, state: State) {
	//rule.name;
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
		case 'match': {
			emitMatch(expr, state);
			return;
		}
		case 'notMatch': {
			emitNotMatch(expr, state);
			return;
		}
		case 'option': {
			emitOption(expr, state);
			return;
		}
		case 'many': {
			// expr.min
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
	console.log('skip unknown expr', expr);
}

function emitAlt(node: Ast.Alt, state: State) {
	for (let inner of node.exprs) {
		emitExpr(inner, state);
	}
}

function emitSeq(node: Ast.Seq, state: State) {
	for (let expr of node.exprs) {
		emitExpr(expr, state);
	}
}

function emitMatch(node: Ast.Match, state: State) {
	emitExpr(node.expr, state);
}

function emitNotMatch(node: Ast.NotMatch, state: State) {
	emitExpr(node.expr, state);
}

function emitOption(node: Ast.Option, state: State) {
	emitExpr(node.expr, state);
}

function emitMany(node: Ast.Many, state: State) {
	// node.min;
	emitExpr(node.expr, state);
}

function emitStr(node: Ast.Str, state: State) {
	//node.value;
}

function emitRef(node: Ast.Ref, state: State) {
	// node.name;
}
