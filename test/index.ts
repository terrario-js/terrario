import assert from 'assert';
import * as T from '../src/index.js';

describe('Parser', () => {
  describe('parse()', () => {
    it('input', () => {
      const parser = new T.Parser((input, index, children, state) => {
        return T.success(index, null);
      }, []);
      const result = parser.parse('');
      assert.ok(result.success);
    });

    it('state', () => {
      const parser = new T.Parser((input, index, children, state) => {
        if (state.value !== 1) {
          return T.failure(index);
        }
        return T.success(index, null);
      }, []);
      const result = parser.parse('', { value: 1 });
      assert.ok(result.success);
    });
  });

  it('map()', () => {
    const parser = new T.Parser((input, index, children, state) => {
      return T.success(index, 1);
    }, []).map(value => {
      return value === 1 ? 2 : 3;
    });
    const result = parser.parse('');
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 2);
  });

  it('text()', () => {
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
    describe('min = 0', () => {
      it('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(0);

        input = '';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, []);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(0);

        input = 'abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });
    });

    describe('min = 1', () => {
      it('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('').many(1);

        input = '';
        result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(1);

        input = 'abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });

      it('2 items', () => {
        let input: string, result: T.Result<string[]>;

        const parser = T.str('abc').many(1);

        input = 'abcabc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', 'abc']);
        assert.strictEqual(result.index, 6);
      });
    });

    it('with terminator', () => {
      let input: string, result: T.Result<string>;

      const parser = T.seq([
        T.str('('),
        T.char.many(1, T.str(')')).text(),
        T.str(')'),
      ], 1);

      input = '(abc)';
      result = parser.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, 'abc');
      assert.strictEqual(result.index, 5);
    });
  });

  // it('option()', () => {
  // });
});

describe('Combinators', () => {
  describe('str()', () => {
    describe('with string value', () => {
      it('matched', () => {
        const input = 'abc';
        const parser = T.str('abc');
        const result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, input);
        assert.strictEqual(result.index, 3);
      });

      it('not matched', () => {
        const input = 'ab';
        const parser = T.str('abc');
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    it('with RegExp value', () => {
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
      it('success', () => {
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

      it('partial success', () => {
        const input = 'abc1';
        const parser = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      it('failure', () => {
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

    it('with select param', () => {
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

  it('alt()', () => {
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

  describe('sep()', () => {
    describe('min = 2', () => {
      it('0 item', () => {
        let input, result;

        const parser = T.sep(T.str('abc'), T.str(','), 2);

        input = '';
        result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input, result;

        const parser = T.sep(T.str('abc'), T.str(','), 2);

        input = 'abc';
        result = parser.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      it('2 items', () => {
        let input, result;

        const parser = T.sep(T.str('abc'), T.str(','), 2);

        input = 'abc,abc';
        result = parser.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', 'abc']);
        assert.strictEqual(result.index, 7);
      });
    });
  });

  // it('lazy()', () => {
  // });

  // it('match()', () => {
  // });

  // it('notMatch()', () => {
  // });

  it('state api', () => {
    let input, parser, result;

    parser = T.seq([
      T.cond(state => state.enabled),
      T.char,
    ]).state('enabled', () => true);

    result = parser.parse('a');
    assert.ok(result.success);
    assert.strictEqual(result.index, 1);

    parser = T.seq([
      T.cond(state => state.enabled),
      T.char,
    ]).state('enabled', () => false);

    result = parser.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);
  });

  it('eof', () => {
    let input, parser, result;

    parser = T.eof;

    result = parser.parse('');
    assert.ok(result.success);
    assert.strictEqual(result.index, 0);

    result = parser.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);
  });

  it('char', () => {
    const input = 'a';
    const parser = T.char;
    const result = parser.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 'a');
    assert.strictEqual(result.index, 1);
  });

  // it('lineBegin()', () => {
  // });

  // it('lineEnd()', () => {
  // });
});

// it('createLanguage()', () => {
// });
