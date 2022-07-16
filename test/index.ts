import assert from 'assert';
import * as P from '../src/index';

it('str', () => {
	const input = 'abc';
	const parser = P.str('abc');
	const result = parser.handler(input, 0, {});
	assert.ok(result.success);
	assert.strictEqual(result.value, 'abc');
	assert.strictEqual(result.index, 3);
});
