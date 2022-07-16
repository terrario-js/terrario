import * as P from 'terrario';

// WIP

const jBool = P.alt([
	P.str('true'),
	P.str('false'),
]).map((value: 'true' | 'false') => {
	return (value === 'true');
});

const jNumber = P.alt([
	P.regexp(/[+-]?[0-9]+\.[0-9]+/),
	P.regexp(/[+-]?[0-9]+/),
]).map((value: string) => {
	return parseFloat(value);
});

const jValue = P.alt([
	jBool,
	jNumber,
]);

function parseJson(input: string) {
	const result = jValue.handler(input, 0, {});
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
