import * as Parser from './internal/peg-parser';
import * as Emitter from './internal/terrario-emitter';

export function compile(input: string): string {
	const parseResult = Parser.parse(input);
	if (!parseResult.success) {
		console.log(JSON.stringify(parseResult));
		throw new Error('parsing error');
	}
	const rules = parseResult.value;
	const code = Emitter.emit(rules);
	return code;
}
