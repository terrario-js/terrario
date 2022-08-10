export type Success<T> = {
	success: true;
	value: T;
	index: number;
};

export type Failure = { success: false };

export type Result<T> = Success<T> | Failure;

export type ParserHandler<T> = (input: string, index: number, state: any) => Result<T>

export function success<T>(index: number, value: T): Success<T> {
	return {
		success: true,
		value: value,
		index: index,
	};
}

export function failure(): Failure {
	return { success: false };
}

export class Parser<T> {
	public name?: string;
	public handler: ParserHandler<T>;

	constructor(handler: ParserHandler<T>, name?: string) {
		this.handler = (input, index, state) => {
			if (state.trace && this.name != null) {
				const pos = `${index}`;
				console.log(`${pos.padEnd(6, ' ')}enter ${this.name}`);
				const result = handler(input, index, state);
				if (result.success) {
					const pos = `${index}:${result.index}`;
					console.log(`${pos.padEnd(6, ' ')}match ${this.name}`);
				} else {
					const pos = `${index}`;
					console.log(`${pos.padEnd(6, ' ')}fail ${this.name}`);
				}
				return result;
			}
			return handler(input, index, state);
		};
		this.name = name;
	}

	parse(input: string, state: any = {}): Result<T> {
		return this.handler(input, 0, state);
	}

	map<U>(fn: (value: T) => U): Parser<U> {
		return new Parser((input, index, state) => {
			const result = this.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			return success(result.index, fn(result.value));
		});
	}

	text(): Parser<string> {
		return new Parser((input, index, state) => {
			const result = this.handler(input, index, state);
			if (!result.success) {
				return result;
			}
			const text = input.slice(index, result.index);
			return success(result.index, text);
		});
	}

	many(min: number): Parser<T[]>
	many(min: number, terminator: Parser<unknown>): Parser<T[]>
	many(min: number, terminator?: Parser<unknown>): Parser<T[]> {
		return (terminator != null) ? manyWithout(this, min, terminator) : many(this, min);
	}

	option(): Parser<T | null> {
		return alt([
			this,
			succeeded(null),
		]);
	}
}

function many<T>(parser: Parser<T>, min: number): Parser<T[]> {
	return new Parser((input, index, state) => {
		let result;
		let latestIndex = index;
		const accum: T[] = [];
		while (latestIndex < input.length) {
			result = parser.handler(input, latestIndex, state);
			if (!result.success) {
				break;
			}
			latestIndex = result.index;
			accum.push(result.value);
		}
		if (accum.length < min) {
			return failure();
		}
		return success(latestIndex, accum);
	});
}

function manyWithout<T>(parser: Parser<T>, min: number, terminator: Parser<unknown>): Parser<T[]> {
	return many(seq([
		notMatch(terminator),
		parser,
	], 1), min);
}

export function str<T extends string>(value: T): Parser<T>
export function str(pattern: RegExp): Parser<string>
export function str(value: string | RegExp): Parser<string> {
	return (typeof value == 'string') ? strWithString(value) : strWithRegExp(value);
}

function strWithString<T extends string>(value: T): Parser<T> {
	return new Parser((input, index, _state) => {
		if ((input.length - index) < value.length) {
			return failure();
		}
		if (input.substr(index, value.length) !== value) {
			return failure();
		}
		return success(index + value.length, value);
	});
}

function strWithRegExp(pattern: RegExp): Parser<string> {
	const re = RegExp(`^(?:${pattern.source})`, pattern.flags);
	return new Parser((input, index, _state) => {
		const text = input.slice(index);
		const result = re.exec(text);
		if (result == null) {
			return failure();
		}
		return success(index + result[0].length, result[0]);
	});
}

type SeqResultItem<T> = T extends Parser<infer R> ? R : never;
type SeqResult<T> = T extends [infer Head, ...infer Tail] ? [SeqResultItem<Head>, ...SeqResult<Tail>] : [];

export function seq<T extends Parser<any>[]>(parsers: [...T]): Parser<SeqResult<[...T]>>;
export function seq<T extends Parser<any>[], U extends number>(parsers: [...T], select: U): T[U];
export function seq(parsers: Parser<any>[], select?: number) {
	return (select == null) ? seqAll(parsers) : seqSelect(parsers, select);
}

function seqAll<T extends Parser<any>[]>(parsers: [...T]): Parser<SeqResult<[...T]>> {
	return new Parser((input, index, state) => {
		let result;
		let latestIndex = index;
		const accum = [];
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, latestIndex, state);
			if (!result.success) {
				return result;
			}
			latestIndex = result.index;
			accum.push(result.value);
		}
		return success(latestIndex, (accum as SeqResult<[...T]>));
	});
}

function seqSelect<T extends Parser<any>[], U extends number>(parsers: [...T], select: U): T[U] {
	return seqAll(parsers).map(values => values[select]);
}

export function alt<T extends Parser<unknown>[]>(parsers: T): T[number] {
	return new Parser((input, index, state) => {
		let result;
		for (let i = 0; i < parsers.length; i++) {
			result = parsers[i].handler(input, index, state);
			if (result.success) {
				return result;
			}
		}
		return failure();
	});
}

export function sep<T>(item: Parser<T>, separator: Parser<unknown>, min: number): Parser<T[]> {
	if (min < 1) {
		throw new Error('"min" must be a value greater than or equal to 1.');
	}
	return seq([
		item,
		seq([
			separator,
			item,
		], 1).many(min - 1),
	]).map(result => [result[0], ...result[1]]);
}

export function lazy<T>(fn: () => Parser<T>): Parser<T> {
	const parser: Parser<T> = new Parser((input, index, state) => {
		parser.handler = fn().handler;
		return parser.handler(input, index, state);
	});
	return parser;
}

export function succeeded<T>(value: T): Parser<T> {
	return new Parser((_input, index, _state) => {
		return success(index, value);
	});
}

export function match<T>(parser: Parser<T>): Parser<T> {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return result.success
			? success(index, result.value)
			: failure();
	});
}

export function notMatch(parser: Parser<unknown>): Parser<null> {
	return new Parser((input, index, state) => {
		const result = parser.handler(input, index, state);
		return !result.success
			? success(index, null)
			: failure();
	});
}

export function cond(predicate: (state: any) => boolean): Parser<null> {
	return new Parser((input, index, state) => {
		return predicate(state)
			? success(index, null)
			: failure();
	});
}

export const cr = str('\r');
export const lf = str('\n');
export const crlf = str('\r\n');
export const newline = alt([crlf, cr, lf]);

export const eof = new Parser((input, index, _state) => {
	return index >= input.length
		? success(index, null)
		: failure();
});

export const char = new Parser((input, index, _state) => {
	if ((input.length - index) < 1) {
		return failure();
	}
	const value = input.charAt(index);
	return success(index + 1, value);
});

export const lineBegin = new Parser((input, index, state) => {
	if (index === 0) {
		return success(index, null);
	}
	if (cr.handler(input, index - 1, state).success) {
		return success(index, null);
	}
	if (lf.handler(input, index - 1, state).success) {
		return success(index, null);
	}
	return failure();
});

export const lineEnd = match(alt([
	eof,
	cr,
	lf,
])).map(() => null);

//type Syntax<T> = (rules: Record<string, Parser<T>>) => Parser<T>;
//type SyntaxReturn<T> = T extends (rules: Record<string, Parser<any>>) => infer R ? R : never;
//export function createLanguage2<T extends Record<string, Syntax<any>>>(syntaxes: T): { [K in keyof T]: SyntaxReturn<T[K]> } {

// TODO: 関数の型宣言をいい感じにしたい
export function createLanguage<T>(syntaxes: { [K in keyof T]: (r: Record<string, Parser<any>>) => T[K] }): T {
	const rules: Record<string, Parser<any>> = {};
	for (const key of Object.keys(syntaxes)) {
		rules[key] = lazy(() => {
			const parser = (syntaxes as any)[key](rules);
			if (parser == null || !(parser instanceof Parser)) {
				throw new Error('syntax must return a parser.');
			}
			parser.name = key;
			return parser;
		});
	}
	return rules as any;
}
