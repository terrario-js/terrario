import * as P from '../index';

const _ = P.regexp(/[ \t]/);

// TODO: [a-z]
// TODO: { /*action*/ }

const lang = P.createLanguage({
	identifier: r => P.seq([
		P.regexp(/[a-z_]/i),
		P.regexp(/[a-z0-9_]*/i),
	]).text(),

	rules: r => {
		const separator = P.seq([
			_.many(0),
			P.newline,
			P.alt([_, P.newline]).many(0),
		]);
		return P.seq([
			P.sep(r.rule, separator, 1),
			separator.option(),
		], 0);
	},

	rule: r => {
		return P.seq([
			r.identifier,
			P.alt([_, P.newline]).many(0),
			P.str('='),
			P.alt([_, P.newline]).many(0),
			r.exprLayer1,
		]).map(values => {
			return { type: 'rule', name: values[0], expr: values[4] };
		});
	},

	// expr1 / expr2
	exprLayer1: r => {
		const choiceSep = P.seq([
			P.alt([_, P.newline]).many(1),
			P.str('/'),
			P.alt([_, P.newline]).many(1),
		]);
		const choice = P.sep(r.exprLayer2, choiceSep, 2).map(values => {
			return { type: 'choice', exprs: values };
		});
		return P.alt([
			choice,
			r.exprLayer2,
		]);
	},

	// expr1 expr2
	exprLayer2: r => {
		const sequence = P.sep(r.exprLayer3, P.alt([_, P.newline]).many(1), 2).map(values => {
			return { type: 'sequence', exprs: values };
		});
		return P.alt([
			sequence,
			r.exprLayer3,
		]);
	},

	// expr? expr+ expr*
	exprLayer3: r => {
		const exprOp = P.seq([
			r.exprLayer4,
			P.alt([_, P.newline]).many(0),
			P.alt([
				P.str('?').map(v => { return { type: 'option' }; }),
				P.str('+').map(v => { return { type: 'many', min: 1 }; }),
				P.str('*').map(v => { return { type: 'many', min: 0 }; }),
			]),
		]).map(values => {
			return { ...values[0], op: values[2] };
		});
		return P.alt([
			exprOp,
			r.exprLayer4,
		]);
	},

	exprLayer4: r => P.alt([
		r.stringLiteral,
		r.ref,
		r.group,
	]),

	stringLiteral: r => P.seq([
		P.str('"'),
		P.seq([
			P.notMatch(P.alt([P.str('"'), P.cr, P.lf])),
			P.char,
		]).many(0).text(),
		P.str('"'),
	], 1).map(value => {
		return { type: 'string', value: value };
	}),

	ref: r => {
		return P.seq([
			r.identifier,
			P.notMatch(P.seq([
				P.alt([_, P.newline]).many(0),
				P.str('='),
			])),
		]).map(values => {
			return { type: 'ref', name: values[0] };
		});
	},

	group: r => P.seq([
		P.str('('),
		P.alt([_, P.newline]).many(0),
		r.exprLayer1,
		P.alt([_, P.newline]).many(0),
		P.str(')'),
	], 2),
});

export function parse(input: string) {
	return lang.rules.parse(input, {});
}
