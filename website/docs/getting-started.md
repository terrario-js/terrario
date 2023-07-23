---
sidebar_position: 0
---

# Getting Started

## Terrarioのインストール

Terrarioはnpmを使って簡単に導入できます。  
以下のコマンドで現在のディレクトリにTerrarioをインストールします。

```
$ npm i terrario
```

## パーサーを作成する

TerrarioはTypeScriptとJavaScriptの両方をサポートしています。

早速、Node.jsで動作する基本的なパーサーを作成してみましょう。  
簡単な例として、コンマ区切りの数字が入った文字列を受け取って数値の配列に変換するパーサーを作成します。  
以下の内容を記述してindex.jsという名前で保存してください。今回はJavaScriptで記述しています。

```js
const T = require('terrario');

const number = T.seq([
  T.str(/[1-9]/),
  T.str(/[0-9]/).many(0),
]).text().map(x => {
  return parseInt(x);
});
const parser = T.sep(number, T.str(','));

console.log(parser.parse('123,456'));
console.log(parser.parse('222'));
console.log(parser.parse('aaa'));
```

このプログラムでは、いくつかのコンビネータと呼ばれる関数が使用されています。
コンビネータは引数の内容に応じて新しいパーサーを生成します。
- `T.seq`はパーサーの配列を受け取って、それらを順番に適用するパーサーを生成します。指定した順番通りに入力文字列を消費できた場合にのみ、そのパーサーは成功したとみなされます。  

## パーサーを実行してみる

以下のコマンドでプログラムを実行します。

```
$ node index.js
```

出力:
```js
{ success: true, value: [ 123, 456 ], index: 7 }
{ success: true, value: [ 222 ], index: 3 }
{ success: false, index: 0 }
```

入力した文字列が数値の配列に変換されています。  
無効な入力に対しては失敗することも確認できます。

このように、比較的少ない記述でパーサーを作成することができました。
