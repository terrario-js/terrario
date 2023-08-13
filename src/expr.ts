import * as T from './index.js';
// import { inspect } from 'util';

export function prattConfig<A, M>(): PrattConfig<A, M> {
  return new PrattConfig();
}

export class PrattConfig<A, M> {
  valueParser?: T.Parser<A>;
  operatorGroups: OperatorGroup<A, M>[] = [];

  setAtom(parser: T.Parser<A>) {
    this.valueParser = parser;
    return this;
  }

  addOperatorGroup(): OperatorGroup<A, M> {
    const group = new OperatorGroup<A, M>();
    this.operatorGroups.push(group);
    return group;
  }

  insertOperatorGroup(index: number): OperatorGroup<A, M> {
    const group = new OperatorGroup<A, M>();
    this.operatorGroups.splice(index, 0, group);
    return group;
  }

  /**
   * Create a new Pratt parser.
  */
  build() {
    return buildPrattParser(this);
  }
}

export class OperatorGroup<V, M> {
  _operators: OperatorSource<V | M, M>[] = [];

  addPrefix<T>(match: T.Parser<T>, map: (op: T, value: V | M) => M) {
    this._operators.push({ kind: 'prefix', match, map });
    return this;
  }

  addInfix<T>(match: T.Parser<T>, assoc: 'left' | 'right', map: (op: T, left: V | M, right: V | M) => M) {
    this._operators.push({ kind: 'infix', assoc, match, map });
    return this;
  }

  addPostfix<T>(match: T.Parser<T>, map: (op: T, value: V | M) => M) {
    this._operators.push({ kind: 'postfix', match, map });
    return this;
  }

  clear() {
    this._operators.length = 0;
    return this;
  }
}

type OperatorSource<V, M> =
  | PrefixOperatorSource<V, M>
  | InfixOperatorSource<V, M>
  | PostfixOperatorSource<V, M>;

type PrefixOperatorSource<V, M> = {
  kind: 'prefix',
  match: T.Parser<any>,
  map: (op: any, value: V) => M,
};

type InfixOperatorSource<V, M> = {
  kind: 'infix',
  match: T.Parser<any>,
  assoc: 'left' | 'right',
  map: (op: any, left: V, right: V) => M,
};

type PostfixOperatorSource<V, M> = {
  kind: 'postfix',
  match: T.Parser<any>,
  map: (op: any, value: V) => M,
}

function buildPrattParser<A, M>(config: PrattConfig<A, M>): T.Parser<A | M> {
  if (config.valueParser == null) {
    throw new TypeError('value parser is not configured');
  }
  const atom = config.valueParser;
  const operators = setupOperators(config.operatorGroups);

  // pratt parser
  // https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html
  const prattParser: T.Parser<A | M> = T.parser((input, index, children, state) => {
    let latestIndex = index;
    let result, opResult;
    let leftValue;

    // prefix operator
    opResult = tryParseOps(input, state, latestIndex, operators, 'prefix');
    if (opResult) {
      // consume prefix operator
      latestIndex = opResult.index;
      // expression
      const bp = opResult.op.bp;
      result = prattParser
        .state('_minBp', () => bp)
        .exec(input, state, latestIndex);
      if (!result.success) {
        return result;
      }
      const opExpr = opResult.op.map(opResult.value, result.value);
      leftValue = opExpr;
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
      // postfix operator
      opResult = tryParseOps(input, state, latestIndex, operators, 'postfix');
      if (opResult) {
        if (opResult.op.bp < state._minBp) {
          break;
        }
        const opExpr = opResult.op.map(opResult.value, leftValue);
        leftValue = opExpr;
        // consume
        latestIndex = opResult.index;
        continue;
      }

      // infix operator
      opResult = tryParseOps(input, state, latestIndex, operators, 'infix');
      if (opResult) {
        if (opResult.op.leftBp < state._minBp) {
          break;
        }
        // consume
        latestIndex = opResult.index;

        // expression
        const bp = opResult.op.rightBp;
        result = prattParser
          .state('_minBp', () => bp)
          .exec(input, state, latestIndex);
        if (!result.success) {
          return result;
        }
        const rightValue = result.value;
        const opExpr = opResult.op.map(opResult.value, leftValue, rightValue);
        leftValue = opExpr;
        // consume expression
        latestIndex = result.index;
        continue;
      }
      break;
    }

    return T.success(latestIndex, leftValue);
  }, [], 'operatorExpr');

  return prattParser
    .state('_minBp', () => 0);
}

function tryParseOps<O, V, M>(
  input: string,
  state: any,
  index: number,
  ops: Operator<V, M>[],
  kind: 'prefix'
): { value: O, index: number, op: PrefixOperator<V, M> } | undefined
function tryParseOps<O, V, M>(
  input: string,
  state: any,
  index: number,
  ops: Operator<V, M>[],
  kind: 'infix'
): { value: O, index: number, op: InfixOperator<V, M> } | undefined
function tryParseOps<O, V, M>(
  input: string,
  state: any,
  index: number,
  ops: Operator<V, M>[],
  kind: 'postfix'
): { value: O, index: number, op: PostfixOperator<V, M> } | undefined
function tryParseOps<O, V, M>(
  input: string,
  state: any,
  index: number,
  ops: Operator<V, M>[],
  kind: 'prefix' | 'infix' | 'postfix'
): { value: any, index: number, op: Operator<V, M> } | undefined {
  for (const op of ops) {
    if (op.kind !== kind) {
      continue;
    }
    const result = op.match.exec(input, state, index);
    if (result.success) {
      return { value: result.value, index: result.index, op };
    }
  }
  return undefined;
}

function setupOperators<A, M>(groups: OperatorGroup<A, M>[]): Operator<A, M>[] {
  const ops: Operator<A, M>[] = [];
  let bp = 2 * groups.length;
  for (const group of groups) {
    for (const op of group._operators) {
      switch (op.kind) {
        case 'prefix':
        case 'postfix': {
          ops.push({ kind: op.kind, match: op.match, bp, map: op.map });
          break;
        }
        case 'infix': {
          const leftBp = op.assoc == 'right' ? bp + 1 : bp;
          const rightBp = op.assoc == 'left' ? bp + 1 : bp;
          ops.push({ kind: op.kind, match: op.match, leftBp, rightBp, map: op.map });
          break;
        }
      }
    }
    bp -= 2;
  }
  // console.log(inspect(ops, { depth: 10 }));
  return ops;
}

type Operator<V, M> =
  | PrefixOperator<V, M>
  | InfixOperator<V, M>
  | PostfixOperator<V, M>;

type PrefixOperator<V, M> = {
  kind: 'prefix',
  match: T.Parser<any>,
  bp: number,
  map: (op: any, value: V | M) => M,
};

type InfixOperator<V, M> = {
  kind: 'infix',
  match: T.Parser<any>,
  leftBp: number,
  rightBp: number,
  map: (op: any, left: V | M, right: V | M) => M,
};

type PostfixOperator<V, M> = {
  kind: 'postfix',
  match: T.Parser<any>,
  bp: number,
  map: (op: any, value: V | M) => M,
}
