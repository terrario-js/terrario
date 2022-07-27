import * as Parser from './internal/peg-parser';
//import * as Builder from './internal/terrario-builder';
import * as P from '..';

// TODO

export function run(input: string): P.Result<any> {
	const rules = Parser.parse(input);
	const result = P.str('aaa').parse(input);
	return result;
}
