import assert from 'assert';
import * as T from '../src/index.js';

describe('Parser', () => {
  describe('parse()', () => {
    test('input', () => {
      const parser = T.parser((input, index, state) => {
        return T.success(index, null);
      });
      const result = parser.parse('');
      assert.ok(result.success);
    });

    test('state', () => {
      const parser = T.parser((input, index, state) => {
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
    const parser = T.parser((input, index, state) => {
      return T.success(index, 1);
    }).map(value => {
      return value === 1 ? 2 : 3;
    });
    const result = parser.parse('');
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 2);
  });

  test('span()', () => {
    const input = 'abc123';
    const parser = T.seq([
      T.token('abc'),
      T.token('123'),
    ]).span();
    const result = parser.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, input);
    assert.strictEqual(result.index, 6);
  });

  describe('many()', () => {
    describe('basic', () => {
      test('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.token('abc').many();

        input = '';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, []);
        assert.strictEqual(result.index, 0);
      });

      test('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.token('abc').many();

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

        const parser = T.token('').many(1);

        input = '';
        result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      test('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.token('abc').many(1);

        input = 'abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });

      test('2 items', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.token('abc').many(1);

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
        T.token('('),
        T.any.many({ min: 1, notMatch: T.token(')') }).span(),
        T.token(')'),
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
  describe('token()', () => {
    describe('with string value', () => {
      test('matched', () => {
        const input = 'abc';
        const parser = T.token('abc');
        const result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, input);
        assert.strictEqual(result.index, 3);
      });

      test('not matched', () => {
        const input = 'ab';
        const parser = T.token('abc');
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    test('with RegExp value', () => {
      const input = 'abcDEF';
      const parser = T.token(/[a-z]+/i);
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
          T.token('abc'),
          T.token('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', '123']);
        assert.strictEqual(result.index, 6);
      });

      test('partial success', () => {
        const input = 'abc1';
        const parser = T.seq([
          T.token('abc'),
          T.token('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      test('failure', () => {
        const input = 'a';
        const parser = T.seq([
          T.token('abc'),
          T.token('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    test('with select param', () => {
      const input = 'abc123';
      const parser = T.seq([
        T.token('abc'),
        T.token('123'),
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
      T.token('abc'),
      T.token('123'),
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
      T.any
    ).state('enabled', () => true);

    result = parser.parse('a');
    assert.ok(result.success);
    assert.strictEqual(result.index, 1);

    // 2
    parser = T.where(state => state.enabled,
      T.any
    ).state('enabled', () => false);

    result = parser.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);

    // 3
    parser = T.seq([
      T.succeeded(null).state('enabled', () => true),
      T.where(state => !state.enabled,
        T.token('a')
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

  test('any', () => {
    const input = 'a';
    const parser = T.any;
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
