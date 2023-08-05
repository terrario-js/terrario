import assert from 'assert';
import * as T from '../src/index.js';

describe('Parser', () => {
  describe('parse()', () => {
    test('input', () => {
      const parser = T.parser((input, index, children, state) => {
        return T.success(index, null);
      });
      const result = parser.parse('');
      assert.ok(result.success);
    });

    test('state', () => {
      const parser = T.parser((input, index, children, state) => {
        if (state.value !== 1) {
          return T.failure(index);
        }
        return T.success(index, null);
      });
      const result = parser.parse('', { value: 1 });
      assert.ok(result.success);
    });
  });

  test('map()', () => {
    const parser = T.parser((input, index, children, state) => {
      return T.success(index, 1);
    }).map(value => {
      return value === 1 ? 2 : 3;
    });
    const result = parser.parse('');
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 2);
  });

  test('text()', () => {
    const input = 'abc123';
    const parser = T.seq([
      T.str('abc'),
      T.str('123'),
    ]).text();
    const result = parser.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, input);
    assert.strictEqual(result.index, 6);
  });

  describe('many()', () => {
    describe('basic', () => {
      test('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many();

        input = '';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, []);
        assert.strictEqual(result.index, 0);
      });

      test('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many();

        input = 'abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });
    });

    describe('min = 1', () => {
      test('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('').many(1);

        input = '';
        result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      test('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(1);

        input = 'abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });

      test('2 items', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(1);

        input = 'abcabc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', 'abc']);
        assert.strictEqual(result.index, 6);
      });
    });

    test('with terminator', () => {
      let input: string, result: T.Result<string>;

      const parser = T.seq([
        T.str('('),
        T.char.many({ min: 1, notMatch: T.str(')') }).text(),
        T.str(')'),
      ], 1);

      input = '(abc)';
      result = parser.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, 'abc');
      assert.strictEqual(result.index, 5);
    });
  });

  // test('option()', () => {
  // });
});

describe('Combinators', () => {
  describe('str()', () => {
    describe('with string value', () => {
      test('matched', () => {
        const input = 'abc';
        const parser = T.str('abc');
        const result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, input);
        assert.strictEqual(result.index, 3);
      });

      test('not matched', () => {
        const input = 'ab';
        const parser = T.str('abc');
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    test('with RegExp value', () => {
      const input = 'abcDEF';
      const parser = T.str(/[a-z]+/i);
      const result = parser.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, input);
      assert.strictEqual(result.index, 6);
    });
  });

  describe('seq()', () => {
    describe('all', () => {
      test('success', () => {
        const input = 'abc123';
        const parser = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', '123']);
        assert.strictEqual(result.index, 6);
      });

      test('partial success', () => {
        const input = 'abc1';
        const parser = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      test('failure', () => {
        const input = 'a';
        const parser = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    test('with select param', () => {
      const input = 'abc123';
      const parser = T.seq([
        T.str('abc'),
        T.str('123'),
      ], 0);
      const result = parser.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, 'abc');
      assert.strictEqual(result.index, 6);
    });
  });

  test('alt()', () => {
    const input = '123';
    const parser = T.alt([
      T.str('abc'),
      T.str('123'),
    ]);
    const result = parser.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, input);
    assert.strictEqual(result.index, 3);
  });

  // test('lazy()', () => {
  // });

  // test('match()', () => {
  // });

  // test('notMatch()', () => {
  // });

  test('state api', () => {
    let input, parser, result;

    // 1
    parser = T.where(state => state.enabled,
      T.char
    ).state('enabled', () => true);

    result = parser.parse('a');
    assert.ok(result.success);
    assert.strictEqual(result.index, 1);

    // 2
    parser = T.where(state => state.enabled,
      T.char
    ).state('enabled', () => false);

    result = parser.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);

    // 3
    parser = T.seq([
      T.succeeded(null).state('enabled', () => true),
      T.where(state => !state.enabled,
        T.str('a')
      ),
    ], 1);

    result = parser.parse('a');
    assert.ok(result.success);
    assert.strictEqual(result.index, 1);

  });

  test('eof', () => {
    let input, parser, result;

    parser = T.eof;

    result = parser.parse('');
    assert.ok(result.success);
    assert.strictEqual(result.index, 0);

    result = parser.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);
  });

  test('char', () => {
    const input = 'a';
    const parser = T.char;
    const result = parser.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 'a');
    assert.strictEqual(result.index, 1);
  });

  // test('lineBegin()', () => {
  // });

  // test('lineEnd()', () => {
  // });
});

// test('language()', () => {
// });

test('infix', () => {
  const parser = T.infix(T.str(/[0-9]/).many(1).text(), {
    ops: [
      { op: '+', prec: 1, assoc: 'left' },
      { op: '*', prec: 2, assoc: 'left' },
    ]
  });

  const input = '12+34*5+67';
  const result = parser.parse(input);
  assert.ok(result.success);
  assert.strictEqual(result.index, 10);
  assert.deepStrictEqual(result.value, { op: '+', left: { op: '+', left: '12', right: { op: '*', left: '34', right: '5' }}, right: '67' });
});
