WIP!

## Get started

Terrarioはnpmを使って簡単に導入できます。
以下のコマンドで現在のディレクトリにTerrarioをインストールします。
```
$ npm i terrario
```

早速、Node.jsで動作する基本的なパーサーを作成してみましょう。
TerrarioはTypeScriptとJavaScriptの両方をサポートしていますが、今回はJavaScriptでプログラムを作成します。
以下の内容を記述してindex.jsという名前で保存します。
```js
const T = require('terrario');

const parser = T.alt([
  T.str('abc'),
  T.str('xyz'),
]).many(1);

console.log(parser.parse('abc'));
console.log(parser.parse('xyz'));
```

以下のコマンドでプログラムを実行します。
```
$ node index.js
```

出力:
```js
{ success: true, value: [ 'abc' ], index: 3 }
{ success: true, value: [ 'xyz' ], index: 3 }
```

## Language parsing
TODO

## Conditional branching by state
TODO

## Custom parsers
TODO
