import * as Parser from './internal/parser';
import * as Emitter from './internal/emitter';

export function compile(input: string): string {
	const rules = Parser.parse(input);
	const code = Emitter.emit(rules);
	return code;
}
