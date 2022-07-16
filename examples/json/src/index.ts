import * as P from 'terrario';

// WIP

const spacing = P.regexp(/[ \t\r\n]/);

const lang = P.createLanguage({
	value: r => P.alt([
		r.bool,
		r.string,
		r.number,
	]),

	bool: r => P.alt([
		P.str('true'),
		P.str('false'),
	]).map((value: 'true' | 'false') => {
		return (value === 'true');
	}),

	string: r => P.seq([
		P.str('"'),
		P.seq([
			P.notMatch(P.alt([P.str('"'), P.cr, P.lf])),
			P.any
		]).atLeast(0).text(),
		P.str('"'),
	], 1),

	number: r => P.alt([
		P.regexp(/[+-]?[0-9]+\.[0-9]+/),
		P.regexp(/[+-]?[0-9]+/),
	]).map((value: string) => {
		return parseFloat(value);
	}),

});

const json = P.seq([
	spacing.atLeast(0),
	lang.value,
	spacing.atLeast(0),
], 1);

function parseJson(input: string) {
	const result = json.handler(input, 0, {});
	if (!result.success || result.index < input.length) {
		throw new Error('failed to parse JSON.');
	}
	return result.value;
}

console.log(parseJson('true'));
console.log(parseJson('false'));
console.log(parseJson('123'));
console.log(parseJson('-123'));
console.log(parseJson('123.45'));
console.log(parseJson('-123.45'));
console.log(parseJson('"abc"'));
