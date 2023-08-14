import { token as T } from 'terrario';

type OperatorInfo = {
  kind: 'prefix' | 'postfix',
  name: string,
  match: T.Parser<any>,
  bp: number,
} | {
  kind: 'infix',
  name: string,
  match: T.Parser<any>,
  leftBp: number,
  rightBp: number,
};

export interface Operator<U> {
  kind: 'pow' | 'plus' | 'minus' | 'mul' | 'div' | 'mod' | 'add' | 'sub',
  exprs: (U | Operator<U>)[],
}

export function buildPrattParser<U>(atom: T.Parser<U>): T.Parser<U | Operator<U>> {
  const operators: OperatorInfo[] = [
    { kind: 'infix', name: 'pow', match: T.token('**'), leftBp: 41, rightBp: 40 }, // right to left
    { kind: 'prefix', name: 'plus', match: T.token('+'), bp: 30 },
    { kind: 'prefix', name: 'minus', match: T.token('-'), bp: 30 },
    { kind: 'infix', name: 'mul', match: T.token('*'), leftBp: 20, rightBp: 21 }, // left to right
    { kind: 'infix', name: 'div', match: T.token('/'), leftBp: 20, rightBp: 21 }, // left to right
    { kind: 'infix', name: 'mod', match: T.token('%'), leftBp: 20, rightBp: 21 }, // left to right
    { kind: 'infix', name: 'add', match: T.token('+'), leftBp: 10, rightBp: 11 }, // left to right
    { kind: 'infix', name: 'sub', match: T.token('-'), leftBp: 10, rightBp: 11 }, // left to right
  ];

  const prattParser: T.Parser<U | Operator<U>> = T.parser((input, index, state) => {
    let latestIndex = index;
    let leftValue;
    let result, opResult;
    // find prefix operator
    opResult = undefined;
    for (const op of operators) {
      if (op.kind === 'prefix') {
        const result = op.match.exec(input, state, latestIndex);
        if (result.success) {
          opResult = { index: result.index, op };
          break;
        }
      }
    }
    if (opResult) {
      // consume prefix operator
      latestIndex = opResult.index;
      // expression
      const bp = opResult.op.bp;
      result = prattParser
        .state('minBp', () => bp)
        .exec(input, state, latestIndex);
      if (!result.success) {
        return result;
      }
      leftValue = { kind: opResult.op.name, exprs: [result.value] } as Operator<U>;
      // consume expression
      latestIndex = result.index;
    } else {
      // atom
      result = atom.exec(input, state, latestIndex);
      if (!result.success) {
        return result;
      }
      leftValue = result.value;
      // consume atom
      latestIndex = result.index;
    }
    while (latestIndex < input.length) {
      // find postfix operator
      opResult = undefined;
      for (const op of operators) {
        if (op.kind === 'postfix') {
          const result = op.match.exec(input, state, latestIndex);
          if (result.success) {
            opResult = { value: result.value, index: result.index, op };
            break;
          }
        }
      }
      if (opResult) {
        if (opResult.op.bp < state._minBp) {
          break;
        }
        leftValue = { kind: opResult.op.name, exprs: [leftValue] } as Operator<U>;
        // consume postfix operator
        latestIndex = opResult.index;
        continue;
      }
      // find infix operator
      opResult = undefined;
      for (const op of operators) {
        if (op.kind === 'infix') {
          const result = op.match.exec(input, state, latestIndex);
          if (result.success) {
            opResult = { value: result.value, index: result.index, op };
            break;
          }
        }
      }
      if (opResult) {
        if (opResult.op.leftBp < state._minBp) {
          break;
        }
        // consume infix operator
        latestIndex = opResult.index;
        // expression
        const bp = opResult.op.rightBp;
        result = prattParser
          .state('minBp', () => bp)
          .exec(input, state, latestIndex);
        if (!result.success) {
          return result;
        }
        leftValue = { kind: opResult.op.name, exprs: [leftValue, result.value] } as Operator<U>;
        // consume expression
        latestIndex = result.index;
        continue;
      }
      break;
    }
    return T.success(latestIndex, leftValue);
  });

  return prattParser
    .state('minBp', () => 0);
}
