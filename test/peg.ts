import assert from 'assert';
import { parse } from '../src/peg/index';

describe('rule', () => {
	it('single', () => {
		let input, result;

		input = 'test = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n'
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \n';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n  ';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n\n  ';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n  \n  ';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \n\n';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \n  \n';
		result = parse(input);
		assert.ok(result.success);
	});

	it('multiple', () => {
		let input, result;

		input = 'test = "abc"\ntest = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \ntest = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n  test = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n\n  test = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"\n  \n  test = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \n\ntest = "abc"';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"  \n  \ntest = "abc"';
		result = parse(input);
		assert.ok(result.success);
	});

	it('*', () => {
		let input, result;

		input = 'test = "abc"*';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"* "123"*';
		result = parse(input);
		assert.ok(result.success);
	});

	it('+', () => {
		let input, result;

		input = 'test = "abc"+';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"+ "123"+';
		result = parse(input);
		assert.ok(result.success);
	});

	it('?', () => {
		let input, result;

		input = 'test = "abc"?';
		result = parse(input);
		assert.ok(result.success);

		input = 'test = "abc"? "123"?';
		result = parse(input);
		assert.ok(result.success);
	});
});
