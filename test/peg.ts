import assert from 'assert';
import { lang } from '../src/peg/index';

describe('rule', () => {
	it('single', () => {
		let input, result;

		input = 'test = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n'
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \n';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n  ';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n\n  ';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n  \n  ';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \n\n';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \n  \n';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);
	});

	it('multiple', () => {
		let input, result;

		input = 'test = "abc"\ntest = "abc"'
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \ntest = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n  test = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n\n  test = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"\n  \n  test = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \n\ntest = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);

		input = 'test = "abc"  \n  \ntest = "abc"';
		result = lang.rules.handler(input, 0, {});
		assert.ok(result.success);
	});
});
