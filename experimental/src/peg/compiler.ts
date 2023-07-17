import * as Parser from './internal/peg-parser';
import * as Emitter from './internal/terrario-emitter';

export function compile(input: string): string {
  const rules = Parser.parse(input);
  const code = Emitter.emit(rules);
  return code;
}
