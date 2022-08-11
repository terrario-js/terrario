import * as Parser from './internal/peg-parser';
//import * as Builder from './internal/terrario-builder';
import * as T from '..';

// TODO

export function run(input: string): T.Result<any> {
	const parseResult = Parser.parse(input);
	if (!parseResult.success) {
		console.log(JSON.stringify(parseResult));
		throw new Error('parsing error');
	}
	const rules = parseResult.value;
	const result = T.str('aaa').parse(input);
	return result;
}
