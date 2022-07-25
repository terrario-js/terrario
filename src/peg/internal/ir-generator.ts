import * as Ast from './ast-node';
import * as IR from './ir-node';

type State = {};

function processExpr(expr: Ast.Expr, state: State) {
	switch (expr.type) {
		case 'alt': {
			for (let inner of expr.exprs) {
				processExpr(inner, state);
			}
			return;
		}

		case 'seq': {
			for (let inner of expr.exprs) {
				processExpr(inner, state);
			}
			return;
		}

		case 'match': {
			processExpr(expr.expr, state);
			return;
		}

		case 'notMatch': {
			processExpr(expr.expr, state);
			return;
		}

		case 'option': {
			processExpr(expr.expr, state);
			return;
		}

		case 'many': {
			// expr.min
			processExpr(expr.expr, state);
			return;
		}

		case 'str': {
			// expr.value
			return;
		}

		case 'ref': {
			// expr.name
			return;
		}
	}
	console.log('skip unknown expr', expr);
}

export function generate(rules: Ast.Rule[]) {
	const state: State = {};

	// process rules
	for (let rule of rules) {
		// rule.name
		processExpr(rule.expr, state);
	}
}
