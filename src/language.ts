import * as T from './index.js';

/**
 * Create a language
 * 
 * @public
*/
export function language<U>(syntaxes: { [K in keyof U]: (r: Record<string, T.Parser<any>>) => U[K] }): U {
  // TODO: 関数の型宣言をいい感じにしたい
  const rules: Record<string, T.Parser<any>> = {};
  for (const key of Object.keys(syntaxes)) {
    rules[key] = T.lazy(() => {
      const parser = (syntaxes as any)[key](rules);
      if (parser == null || !(parser instanceof T.Parser)) {
        throw new Error('syntax must return a Parser.');
      }
      parser.name = key;
      return parser;
    });
  }
  return rules as any;
}
