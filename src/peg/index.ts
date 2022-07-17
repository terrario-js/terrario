import * as P from '../index';

const space = P.regexp(/[ \t\r\n]/);

const lang = P.createLanguage({
	rule: r => P.seq([
		P.regexp(/[a-z0-9]+/i),
		space.many(0),
		P.str('='),
		space.many(0),
		r.exprLayer1,
		P.str(';'),
	]).map(values => {
		return { type: 'rule', name: values[0], expr: values[4] };
	}),

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
			space.many(1),
			P.str('/'),
			space.many(1),
		]);
		return r.exprLayer2.sep(choiceSep, 2).map(values => {
			return { type: 'choice', exprs: values };
		});
	},

	sequence: r => {
		return r.exprLayer3.sep(space.many(1), 2).map(values => {
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

function parse(input: string) {
	const result = lang.rule.handler(input, 0, {});
	if (!result.success || result.index < input.length) {
		throw new Error('parse error');
	}
	return result.value;
}

let input;

input = 'test = "abc";';

console.log(input, '=>', JSON.stringify(parse(input)));

input = 'test = "abc" "123";';
console.log(input, '=>', JSON.stringify(parse(input)));

input = 'test = "abc" "123" / "xyz";';
console.log(input, '=>', JSON.stringify(parse(input)));
