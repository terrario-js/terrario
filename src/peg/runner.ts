import * as Parser from './internal/parser';
import * as P from '..';

export function run(input: string): P.Result<any> {
	const rules = Parser.parse(input);
	const result = P.str('aaa').parse(input);
	return result;
}
