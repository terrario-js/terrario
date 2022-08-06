import * as Parser from './internal/peg-parser';
//import * as Builder from './internal/terrario-builder';
import * as T from '..';

// TODO

export function run(input: string): T.Result<any> {
	const rules = Parser.parse(input);
	const result = T.str('aaa').parse(input);
	return result;
}
