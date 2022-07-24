import assert from 'assert';
import { parse } from '../src/peg/index';

function parseOk(input: string) {
	const result = parse(input);

	assert.ok(result.success);
	assert.ok(result.index == input.length);

	return result;
}

describe('rule', () => {
	it('single', () => {
		parseOk('test = "abc"');
		parseOk('test = "abc"\n');
		parseOk('test = "abc"  \n');
		parseOk('test = "abc"\n  ');
		parseOk('test = "abc"\n\n  ');
		parseOk('test = "abc"\n  \n  ');
		parseOk('test = "abc"  \n\n');
		parseOk('test = "abc"  \n  \n');
	});

	it('multiple', () => {
		parseOk('test = "abc"\ntest = "abc"');
		parseOk('test = "abc"  \ntest = "abc"');
		parseOk('test = "abc"\n  test = "abc"');
		parseOk('test = "abc"\n\n  test = "abc"');
		parseOk('test = "abc"\n  \n  test = "abc"');
		parseOk('test = "abc"  \n\ntest = "abc"');
		parseOk('test = "abc"  \n  \ntest = "abc"');
	});

	it('sequence', () => {
		parseOk('test = "abc" "123"');
		parseOk('test = "abc"  "123"');
		parseOk('test = "abc"\n"123"');
		parseOk('test = "abc"\n\n"123"');
	});

	it('*', () => {
		parseOk('test = "abc"*');
		parseOk('test = "abc"* "123"*');
	});

	it('+', () => {
		parseOk('test = "abc"+');
		parseOk('test = "abc"+ "123"+');
	});

	it('?', () => {
		parseOk('test = "abc"?');
		parseOk('test = "abc"? "123"?');
	});
});

it('group many', () => {
	parseOk('abc = ("ab" "cd")+');
});
