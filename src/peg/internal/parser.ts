import * as P from '../../index';
import * as N from './ast-node';

const space = P.regexp(/[ \t]/);
const spacing = P.alt([space, P.newline]).many(0);

// TODO: [a-z]
// TODO: { /*action*/ }

const lang = P.createLanguage({
	identifier: r => P.seq([
		P.regexp(/[a-z_]/i),
		P.regexp(/[a-z0-9_]*/i),
	]).text(),

	rules: r => {
		const separator = P.seq([
			space.many(0),
			P.newline,
			spacing,
		]);
		return P.seq([
			P.sep(r.rule as P.Parser<N.Rule>, separator, 1),
			separator.option(),
		], 0);
	},

	rule: r => {
		return P.seq([
			r.identifier,
			spacing,
			P.str('='),
			spacing,
			r.exprLayer1,
		]).map(values => {
			return { type: 'rule', name: values[0], expr: values[4] } as N.Rule;
		});
	},

	// expr1 / expr2
	exprLayer1: r => {
		const choiceSep = P.seq([
			spacing,
			P.str('/'),
			spacing,
		]);
		const choice = P.sep(r.exprLayer2, choiceSep, 2).map(values => {
			return { type: 'alt', exprs: values } as N.Alt;
		});
		return P.alt([
			choice,
			r.exprLayer2,
		]);
	},

	// expr1 expr2
	exprLayer2: r => {
		const separator = P.alt([space, P.newline]).many(1);
		const sequence = P.sep(r.exprLayer3, separator, 2).map(values => {
			return { type: 'seq', exprs: values } as N.Seq;
		});
		return P.alt([
			sequence,
			r.exprLayer3,
		]);
	},

	// &expr !expr
	exprLayer3: r => {
		const exprOp = P.seq([
			P.alt([
				P.str('&').map(v => 'match'),
				P.str('!').map(v => 'notMatch'),
			]),
			spacing,
			r.exprLayer4,
		]).map(values => {
			return { type: values[0], expr: values[1] } as N.Match | N.NotMatch;
		});
		return P.alt([
			exprOp,
			r.exprLayer4,
		]);
	},

	// expr? expr+ expr*
	exprLayer4: r => {
		const exprOp = P.seq([
			r.exprLayer5,
			spacing,
			P.alt([
				P.str('?').map(v => { return { type: 'option' }; }),
				P.str('+').map(v => { return { type: 'many', min: 1 }; }),
				P.str('*').map(v => { return { type: 'many', min: 0 }; }),
			]),
		]).map(values => {
			return { ...values[2], expr: values[0] } as N.Option | N.Many;
		});
		return P.alt([
			exprOp,
			r.exprLayer5,
		]);
	},

	exprLayer5: r => P.alt([
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
		return { type: 'str', value: value } as N.Str;
	}),

	ref: r => {
		return P.seq([
			r.identifier,
			P.notMatch(P.seq([
				spacing,
				P.str('='),
			])),
		]).map(values => {
			return { type: 'ref', name: values[0] } as N.Ref;
		});
	},

	group: r => P.seq([
		P.str('('),
		spacing,
		r.exprLayer1,
		spacing,
		P.str(')'),
	], 2),
});

export function parse(input: string): N.Rule[] {
	const result = (lang.rules as P.Parser<N.Rule[]>).parse(input, {});
	if (!result.success) {
		throw new Error('parsing error');
	}
	return result.value;
}
