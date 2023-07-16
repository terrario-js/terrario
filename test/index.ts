import assert from 'assert';
import * as T from '../src/index';

describe('Pattern', () => {
  describe('parse()', () => {
    it('input', () => {
      const pattern = new T.Pattern((input, index, children, state) => {
        return T.success(index, null);
      }, []);
      const result = pattern.parse('');
      assert.ok(result.success);
    });

    it('state', () => {
      const pattern = new T.Pattern((input, index, children, state) => {
        if (state.value !== 1) {
          return T.failure(index);
        }
        return T.success(index, null);
      }, []);
      const result = pattern.parse('', { value: 1 });
      assert.ok(result.success);
    });
  });

  it('map()', () => {
    const pattern = new T.Pattern((input, index, children, state) => {
      return T.success(index, 1);
    }, []).map(value => {
      return value === 1 ? 2 : 3;
    });
    const result = pattern.parse('');
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, 2);
  });

  it('text()', () => {
    const input = 'abc123';
    const pattern = T.seq([
      T.str('abc'),
      T.str('123'),
    ]).text();
    const result = pattern.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, input);
    assert.strictEqual(result.index, 6);
  });

  describe('many()', () => {
    describe('min = 0', () => {
      it('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const pattern = T.str('abc').many(0);

        input = '';
        result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, []);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const pattern = T.str('abc').many(0);

        input = 'abc';
        result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });
    });

    describe('min = 1', () => {
      it('0 item', () => {
        let input: string, result: T.Result<string[]>;

        const pattern = T.str('').many(1);

        input = '';
        result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input: string, result: T.Result<string[]>;

        const pattern = T.str('abc').many(1);

        input = 'abc';
        result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc']);
        assert.strictEqual(result.index, 3);
      });

      it('2 items', () => {
        let input: string, result: T.Result<string[]>;

        const pattern = T.str('abc').many(1);

        input = 'abcabc';
        result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', 'abc']);
        assert.strictEqual(result.index, 6);
      });
    });

    it('with terminator', () => {
      let input: string, result: T.Result<string>;

      const pattern = T.seq([
        T.str('('),
        T.char.many(1, T.str(')')).text(),
        T.str(')'),
      ], 1);

      input = '(abc)';
      result = pattern.parse(input);
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
        const pattern = T.str('abc');
        const result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, input);
        assert.strictEqual(result.index, 3);
      });

      it('not matched', () => {
        const input = 'ab';
        const pattern = T.str('abc');
        const result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    it('with RegExp value', () => {
      const input = 'abcDEF';
      const pattern = T.str(/[a-z]+/i);
      const result = pattern.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, input);
      assert.strictEqual(result.index, 6);
    });
  });

  describe('seq()', () => {
    describe('all', () => {
      it('success', () => {
        const input = 'abc123';
        const pattern = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = pattern.parse(input);
        assert.ok(result.success);
        assert.deepStrictEqual(result.value, ['abc', '123']);
        assert.strictEqual(result.index, 6);
      });

      it('partial success', () => {
        const input = 'abc1';
        const pattern = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      it('failure', () => {
        const input = 'a';
        const pattern = T.seq([
          T.str('abc'),
          T.str('123'),
        ]);
        const result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });
    });

    it('with select param', () => {
      const input = 'abc123';
      const pattern = T.seq([
        T.str('abc'),
        T.str('123'),
      ], 0);
      const result = pattern.parse(input);
      assert.ok(result.success);
      assert.deepStrictEqual(result.value, 'abc');
      assert.strictEqual(result.index, 6);
    });
  });

  it('alt()', () => {
    const input = '123';
    const pattern = T.alt([
      T.str('abc'),
      T.str('123'),
    ]);
    const result = pattern.parse(input);
    assert.ok(result.success);
    assert.deepStrictEqual(result.value, input);
    assert.strictEqual(result.index, 3);
  });

  describe('sep()', () => {
    describe('min = 2', () => {
      it('0 item', () => {
        let input, result;

        const pattern = T.sep(T.str('abc'), T.str(','), 2);

        input = '';
        result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 0);
      });

      it('1 item', () => {
        let input, result;

        const pattern = T.sep(T.str('abc'), T.str(','), 2);

        input = 'abc';
        result = pattern.parse(input);
        assert.ok(!result.success);
        assert.strictEqual(result.index, 3);
      });

      it('2 items', () => {
        let input, result;

        const pattern = T.sep(T.str('abc'), T.str(','), 2);

        input = 'abc,abc';
        result = pattern.parse(input);
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

  it('cond()', () => {
    let input, pattern, result;

    pattern = T.seq([
      T.cond(state => state.enabled),
      T.char,
    ]);

    result = pattern.parse('a', { enabled: true });
    assert.ok(result.success);
    assert.strictEqual(result.index, 1);

    result = pattern.parse('a', { enabled: false });
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);
  });

  it('eof', () => {
    let input, pattern, result;

    pattern = T.eof;

    result = pattern.parse('');
    assert.ok(result.success);
    assert.strictEqual(result.index, 0);

    result = pattern.parse('a');
    assert.ok(!result.success);
    assert.strictEqual(result.index, 0);
  });

  it('char', () => {
    const input = 'a';
    const pattern = T.char;
    const result = pattern.parse(input);
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
