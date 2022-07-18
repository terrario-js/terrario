import * as P from 'terrario';

const spaces = P.regexp(/[ \t\r\n]*/);

const lang = P.createLanguage({
	value: r => P.alt([
		r.null,
		r.bool,
		r.string,
		r.object,
		r.array,
		r.number,
	]),

	null: r => P.str('null'),

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
			P.char,
		]).many(0).text(),
		P.str('"'),
	], 1),

	number: r => P.alt([
		P.regexp(/[+-]?[0-9]+\.[0-9]+/),
		P.regexp(/[+-]?[0-9]+/),
	]).map((value: string) => {
		return parseFloat(value);
	}),

	object: r => {
		const entry = P.seq([
			r.string,
			spaces,
			P.str(':'),
			spaces,
			r.value,
		]).map((value: unknown[]) => {
			return { key: value[0], value: value[4] };
		});
		const separator = P.seq([
			spaces,
			P.str(','),
			spaces,
		]);
		return P.seq([
			P.str('{'),
			spaces,
			entry.sep(separator, 1).option(),
			spaces,
			P.str('}'),
		], 2).map((value: { key: string, value: unknown }[] | null) => {
			if (value == null) {
				return {};
			}
			const obj: Record<string, unknown> = {};
			for (let kvp of value) {
				obj[kvp.key] = kvp.value;
			}
			return obj;
		});
	},

	array: r => {
		const separator = P.seq([
			spaces,
			P.str(','),
			spaces,
		]);
		return P.seq([
			P.str('['),
			spaces,
			r.value.sep(separator, 1).option(),
			spaces,
			P.str(']'),
		], 2).map((value: unknown[] | null) => {
			return (value != null ? value : []);
		});
	},
});

const json = P.seq([
	spaces,
	lang.value,
	spaces,
], 1);

function parseJson(input: string) {
	const result = json.handler(input, 0, {});
	if (!result.success || result.index < input.length) {
		throw new Error('failed to parse JSON.');
	}
	return result.value;
}

console.log(parseJson('{ "id": 1, "name": "user", "posts": [{ "text": "hello", "reply": false }, { "text": "@abc yeah", "reply": true }] }'));
