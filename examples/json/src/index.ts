import * as T from 'terrario';

const spaces = T.regexp(/[ \t\r\n]*/);

const lang = T.createLanguage({
	value: r => T.alt([
		r.null,
		r.bool,
		r.string,
		r.object,
		r.array,
		r.number,
	]),

	null: r => T.str('null'),

	bool: r => T.alt([
		T.str('true'),
		T.str('false'),
	]).map((value: 'true' | 'false') => {
		return (value === 'true');
	}),

	string: r => T.seq([
		T.str('"'),
		T.seq([
			T.notMatch(T.alt([T.str('"'), T.cr, T.lf])),
			T.char,
		]).many(0).text(),
		T.str('"'),
	], 1),

	number: r => T.alt([
		T.regexp(/[+-]?[0-9]+\.[0-9]+/),
		T.regexp(/[+-]?[0-9]+/),
	]).map((value: string) => {
		return parseFloat(value);
	}),

	object: r => {
		const entry = T.seq([
			r.string,
			spaces,
			T.str(':'),
			spaces,
			r.value,
		]).map((value: unknown[]) => {
			return { key: value[0], value: value[4] };
		});
		const separator = T.seq([
			spaces,
			T.str(','),
			spaces,
		]);
		return T.seq([
			T.str('{'),
			spaces,
			T.sep(entry, separator, 1).option(),
			spaces,
			T.str('}'),
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
		const separator = T.seq([
			spaces,
			T.str(','),
			spaces,
		]);
		return T.seq([
			T.str('['),
			spaces,
			T.sep(r.value, separator, 1).option(),
			spaces,
			T.str(']'),
		], 2).map((value: unknown[] | null) => {
			return (value != null ? value : []);
		});
	},
});

const json = T.seq([
	spaces,
	lang.value,
	spaces,
], 1);

export function parse(input: string) {
	const result = json.parse(input);
	if (!result.success || result.index < input.length) {
		throw new Error('failed to parse JSON.');
	}
	return result.value;
}
