import assert from 'assert';
import { parse } from '../src/peg/internal/peg-parser';

function parseNoError(input: string) {
	try {
		return parse(input);
	} catch {
		assert.fail();
	}
}

describe('rule', () => {
	it('single', () => {
		parseNoError('test = "abc"');
		parseNoError('test = "abc"\n');
		parseNoError('test = "abc"  \n');
		parseNoError('test = "abc"\n  ');
		parseNoError('test = "abc"\n\n  ');
		parseNoError('test = "abc"\n  \n  ');
		parseNoError('test = "abc"  \n\n');
		parseNoError('test = "abc"  \n  \n');
	});

	it('multiple', () => {
		parseNoError('test = "abc"\ntest = "abc"');
		parseNoError('test = "abc"  \ntest = "abc"');
		parseNoError('test = "abc"\n  test = "abc"');
		parseNoError('test = "abc"\n\n  test = "abc"');
		parseNoError('test = "abc"\n  \n  test = "abc"');
		parseNoError('test = "abc"  \n\ntest = "abc"');
		parseNoError('test = "abc"  \n  \ntest = "abc"');
	});

	it('sequence', () => {
		parseNoError('test = "abc" "123"');
		parseNoError('test = "abc"  "123"');
		parseNoError('test = "abc"\n"123"');
		parseNoError('test = "abc"\n\n"123"');
	});

	it('$', () => {
		parseNoError('test = $"abc"');
	});

	it('&', () => {
		parseNoError('test = &"abc"');
	});

	it('!', () => {
		parseNoError('test = !"abc"');
	});

	it('*', () => {
		parseNoError('test = "abc"*');
		parseNoError('test = "abc"* "123"*');
	});

	it('+', () => {
		parseNoError('test = "abc"+');
		parseNoError('test = "abc"+ "123"+');
	});

	it('?', () => {
		parseNoError('test = "abc"?');
		parseNoError('test = "abc"? "123"?');
	});

	it('.', () => {
		parseNoError('test = .+');
	});
});

it('group many', () => {
	parseNoError('abc = ("ab" "cd")+');
});
