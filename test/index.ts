import assert from 'assert';
import * as T from '../src/index';

describe('Parser', () => {
	describe('parse()', () => {
		it('input', () => {
			const parser = new T.Parser((input, index, state) => {
				return T.success(index, null);
			});
			const result = parser.parse('');
			assert.ok(result.success);
		});

		it('state', () => {
			const parser = new T.Parser((input, index, state) => {
				if (state.value !== 1) {
					return T.failure();
				}
				return T.success(index, null);
			});
			const result = parser.parse('', { value: 1 });
			assert.ok(result.success);
		});
	});

	it('map()', () => {
		const parser = new T.Parser((input, index, state) => {
			return T.success(index, 1);
		}).map(value => {
			return value === 1 ? 2 : 3;
		});
		const result = parser.parse('');
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, 2);
	});

	it('text()', () => {
		const input = 'abc123';
		const parser = T.seq([
			T.str('abc'),
			T.str('123'),
		]).text();
		const result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, input);
		assert.strictEqual(result.index, 6);
	});

	it('many()', () => {
		let input, parser, result;

		parser = T.str('abc').many(1);

		input = 'abc123';
		result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, ['abc']);
		assert.strictEqual(result.index, 3);

		input = 'abcabc123';
		result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, ['abc', 'abc']);
		assert.strictEqual(result.index, 6);

		input = 'ab123';
		result = parser.parse(input);
		assert.ok(!result.success);
	});

	// it('option()', () => {
	// });
});

describe('Combinators', () => {
	describe('str()', () => {
		it('with string value', () => {
			const input = 'abc';
			const parser = T.str('abc');
			const result = parser.parse(input);
			assert.ok(result.success);
			assert.deepStrictEqual(result.value, input);
			assert.strictEqual(result.index, 3);
		});

		it('with RegExp value', () => {
			const input = 'abcDEF';
			const parser = T.str(/[a-z]+/i);
			const result = parser.parse(input);
			assert.ok(result.success);
			assert.deepStrictEqual(result.value, input);
			assert.strictEqual(result.index, 6);
		});
	});

	describe('seq()', () => {
		it('basic', () => {
			const input = 'abc123';
			const parser = T.seq([
				T.str('abc'),
				T.str('123'),
			]);
			const result = parser.parse(input);
			assert.ok(result.success);
			assert.deepStrictEqual(result.value, ['abc', '123']);
			assert.strictEqual(result.index, 6);
		});

		it('with select param', () => {
			const input = 'abc123';
			const parser = T.seq([
				T.str('abc'),
				T.str('123'),
			], 0);
			const result = parser.parse(input);
			assert.ok(result.success);
			assert.deepStrictEqual(result.value, 'abc');
			assert.strictEqual(result.index, 6);
		});
	});

	it('alt()', () => {
		const input = '123';
		const parser = T.alt([
			T.str('abc'),
			T.str('123'),
		]);
		const result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, input);
		assert.strictEqual(result.index, 3);
	});

	it('sep()', () => {
		let input, parser, result;

		parser = T.sep(T.str('abc'), T.str(','), 2);

		input = 'abc,abc';
		result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, ['abc', 'abc']);
		assert.strictEqual(result.index, 7);

		input = 'abc';
		result = parser.parse(input);
		assert.ok(!result.success);
	});

	// it('lazy()', () => {
	// });

	// it('match()', () => {
	// });

	// it('notMatch()', () => {
	// });

	it('cond()', () => {
		let input, parser, result;

		parser = T.seq([
			T.cond(state => state.enabled),
			T.char,
		]);

		result = parser.parse('a', { enabled: true });
		assert.ok(result.success);

		result = parser.parse('a', { enabled: false });
		assert.ok(!result.success);
	});

	it('eof', () => {
		let input, parser, result;

		parser = T.eof;

		result = parser.parse('');
		assert.ok(result.success);

		result = parser.parse('a');
		assert.ok(!result.success);
	});

	it('char', () => {
		const input = 'ab';
		const parser = T.char;
		const result = parser.parse(input);
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, 'a');
		assert.strictEqual(result.index, 1);
	});

	// it('lineBegin()', () => {
	// });

	// it('lineEnd()', () => {
	// });
});

// it('createLanguage()', () => {
// });
