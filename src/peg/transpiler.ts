import * as Parser from './internal/parser';
import * as IrGenerator from './internal/ir-generator';
import * as CodeGenerator from './internal/code-generator';

export function transpile(input: string): string {
	const rules = Parser.parse(input);
	IrGenerator.generate(rules);
	const code = CodeGenerator.generate();

	return code;
}
