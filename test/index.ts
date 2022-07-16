import assert from 'assert';
import * as P from '../src/index';

it('any', () => {
	const input = 'ab';
	const parser = P.any;
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, 'a');
	assert.strictEqual(result.index, 1);
});

it('str', () => {
	const input = 'abc';
	const parser = P.str('abc');
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, input);
	assert.strictEqual(result.index, 3);
});

it('regexp', () => {
	const input = 'abcDEF';
	const parser = P.regexp(/[a-z]+/i);
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, input);
	assert.strictEqual(result.index, 6);
});

it('alt', () => {
	const input = '123';
	const parser = P.alt([
		P.str('abc'),
		P.str('123'),
	]);
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, input);
	assert.strictEqual(result.index, 3);
});

describe('seq', () => {
	it('basic', () => {
		const input = 'abc123';
		const parser = P.seq([
			P.str('abc'),
			P.str('123'),
		]);
		const result = parser.handler(input, 0, {});
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, ['abc', '123']);
		assert.strictEqual(result.index, 6);
	});

	it('with select param', () => {
		const input = 'abc123';
		const parser = P.seq([
			P.str('abc'),
			P.str('123'),
		], 0);
		const result = parser.handler(input, 0, {});
		assert.ok(result.success);
		assert.deepStrictEqual(result.value, 'abc');
		assert.strictEqual(result.index, 6);
	});
});

it('parser.text()', () => {
	const input = 'abc123';
	const parser = P.seq([
		P.str('abc'),
		P.str('123'),
	]).text();
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, input);
	assert.strictEqual(result.index, 6);
});

it('parser.many()', () => {
	let input, parser, result;

	parser = P.str('abc').many(1);

	input = 'abc123';
	result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, ['abc']);
	assert.strictEqual(result.index, 3);

	input = 'abcabc123';
	result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.deepStrictEqual(result.value, ['abc', 'abc']);
	assert.strictEqual(result.index, 6);

	input = 'ab123';
	result = parser.handler(input, 0, {});
	assert.ok(!result.success);
});
