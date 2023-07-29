import * as Api from './index.js';

/**
 * Create a language
 * 
 * @public
*/
export function language<T>(syntaxes: { [K in keyof T]: (r: Record<string, Api.Parser<any>>) => T[K] }): T {
  // TODO: 関数の型宣言をいい感じにしたい
  const rules: Record<string, Api.Parser<any>> = {};
  for (const key of Object.keys(syntaxes)) {
    rules[key] = Api.lazy(() => {
      const parser = (syntaxes as any)[key](rules);
      if (parser == null || !(parser instanceof Api.Parser)) {
        throw new Error('syntax must return a Parser.');
      }
      parser.name = key;
      return parser;
    });
  }
  return rules as any;
}
