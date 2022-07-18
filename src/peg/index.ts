import * as P from '../index';

const _ = P.regexp(/[ \t]/);

export const lang = P.createLanguage({
	rules: r => {
		// const separator = P.alt([
		// 	P.seq([
		// 		P.alt([_, P.newline]).many(0),
		// 		P.str(';'),
		// 		P.alt([_, P.newline]).many(0),
		// 	]),
		// 	P.seq([
		// 		_.many(0),
		// 		P.newline,
		// 		P.alt([_, P.newline]).many(0),
		// 	]),
		// ]);
		const separator = P.seq([
			_.many(0),
			P.newline,
			P.alt([_, P.newline]).many(0),
		]);
		return P.seq([
			r.rule.sep(separator, 1),
			separator.option(),
		], 0);
	},

	rule: r => {
		return P.seq([
			P.regexp(/[a-z0-9]+/i),
			P.alt([_, P.newline]).many(0),
			P.str('='),
			P.alt([_, P.newline]).many(0),
			r.exprLayer1,
		]).map(values => {
			return { type: 'rule', name: values[0], expr: values[4] };
		});
	},

	exprLayer1: r => P.alt([
		r.choice,
		r.exprLayer2,
	]),

	exprLayer2: r => P.alt([
		r.sequence,
		r.exprLayer3,
	]),

	exprLayer3: r => P.alt([
		r.stringLiteral,
	]),

	choice: r => {
		const choiceSep = P.seq([
			P.alt([_, P.newline]).many(1),
			P.str('/'),
			P.alt([_, P.newline]).many(1),
		]);
		return r.exprLayer2.sep(choiceSep, 2).map(values => {
			return { type: 'choice', exprs: values };
		});
	},

	sequence: r => {
		return r.exprLayer3.sep(_.many(1), 2).map(values => {
			return { type: 'sequence', exprs: values };
		});
	},

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
});

// function parse(input: string) {
// 	const result = lang.rules.handler(input, 0, {});
// 	if (!result.success || result.index < input.length) {
// 		throw new Error('parse error');
// 	}
// 	return result.value;
// }
