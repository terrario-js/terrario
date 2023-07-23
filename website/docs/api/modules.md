# Modules
Terrario modules.

## Table of contents

### Classes

- [Parser](classes/Parser.md)

### Type Aliases

- [Failure](modules.md#failure)
- [LazyContext](modules.md#lazycontext)
- [LazyParserOpts](modules.md#lazyparseropts)
- [ParserContext](modules.md#parsercontext)
- [ParserHandler](modules.md#parserhandler)
- [Result](modules.md#result)
- [ResultType](modules.md#resulttype)
- [ResultTypes](modules.md#resulttypes)
- [StrictParserOpts](modules.md#strictparseropts)
- [Success](modules.md#success)

### Variables

- [char](modules.md#char)
- [cr](modules.md#cr)
- [crlf](modules.md#crlf)
- [eof](modules.md#eof)
- [lf](modules.md#lf)
- [lineBegin](modules.md#linebegin)
- [lineEnd](modules.md#lineend)
- [newline](modules.md#newline)
- [sof](modules.md#sof)

### Functions

- [alt](modules.md#alt)
- [cond](modules.md#cond)
- [failure](modules.md#failure-1)
- [language](modules.md#language)
- [lazy](modules.md#lazy)
- [match](modules.md#match)
- [notMatch](modules.md#notmatch)
- [parser](modules.md#parser)
- [seq](modules.md#seq)
- [str](modules.md#str)
- [succeeded](modules.md#succeeded)
- [success](modules.md#success-1)



## Type Aliases

### Failure

Ƭ **Failure**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `success` | ``false`` |

#### Defined in

[index.ts:15](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L15)

___

### LazyContext

Ƭ **LazyContext**<`T`\>: () => [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (): [`Parser`](classes/Parser.md)<`T`\>

##### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:167](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L167)

___

### LazyParserOpts

Ƭ **LazyParserOpts**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children?` | `undefined` |
| `handler?` | `undefined` |
| `lazy` | [`LazyContext`](modules.md#lazycontext)<`T`\> |
| `name?` | `string` |

#### Defined in

[index.ts:153](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L153)

___

### ParserContext

Ƭ **ParserContext**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children` | [`Parser`](classes/Parser.md)<`any`\>[] |
| `handler` | [`ParserHandler`](modules.md#parserhandler)<`T`\> |

#### Defined in

[index.ts:162](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L162)

___

### ParserHandler

Ƭ **ParserHandler**<`T`\>: (`input`: `string`, `index`: `number`, `children`: [`Parser`](classes/Parser.md)<`any`\>[], `state`: `any`) => [`Result`](modules.md#result)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

▸ (`input`, `index`, `children`, `state`): [`Result`](modules.md#result)<`T`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |
| `index` | `number` |
| `children` | [`Parser`](classes/Parser.md)<`any`\>[] |
| `state` | `any` |

##### Returns

[`Result`](modules.md#result)<`T`\>

#### Defined in

[index.ts:160](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L160)

___

### Result

Ƭ **Result**<`T`\>: [`Success`](modules.md#success)<`T`\> \| [`Failure`](modules.md#failure)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:27](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L27)

___

### ResultType

Ƭ **ResultType**<`T`\>: `T` extends [`Parser`](classes/Parser.md)<infer R\> ? `R` : `never`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:170](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L170)

___

### ResultTypes

Ƭ **ResultTypes**<`T`\>: `T` extends [infer Head, ...(infer Tail)] ? [[`ResultType`](modules.md#resulttype)<`Head`\>, ...ResultTypes<Tail\>] : []

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[index.ts:171](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L171)

___

### StrictParserOpts

Ƭ **StrictParserOpts**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `children?` | [`Parser`](classes/Parser.md)<`any`\>[] |
| `handler` | [`ParserHandler`](modules.md#parserhandler)<`T`\> |
| `lazy?` | `undefined` |
| `name?` | `string` |

#### Defined in

[index.ts:146](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L146)

___

### Success

Ƭ **Success**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `success` | ``true`` |
| `value` | `T` |

#### Defined in

[index.ts:1](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L1)

## Variables

### char

• `Const` **char**: [`Parser`](classes/Parser.md)<`string`\>

#### Defined in

[index.ts:349](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L349)

___

### cr

• `Const` **cr**: [`Parser`](classes/Parser.md)<``"\r"``\>

#### Defined in

[index.ts:332](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L332)

___

### crlf

• `Const` **crlf**: [`Parser`](classes/Parser.md)<``"\r\n"``\>

#### Defined in

[index.ts:334](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L334)

___

### eof

• `Const` **eof**: [`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:343](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L343)

___

### lf

• `Const` **lf**: [`Parser`](classes/Parser.md)<``"\n"``\>

#### Defined in

[index.ts:333](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L333)

___

### lineBegin

• `Const` **lineBegin**: [`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:357](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L357)

___

### lineEnd

• `Const` **lineEnd**: [`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:370](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L370)

___

### newline

• `Const` **newline**: [`Parser`](classes/Parser.md)<``"\r"`` \| ``"\n"`` \| ``"\r\n"``\>

#### Defined in

[index.ts:335](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L335)

___

### sof

• `Const` **sof**: [`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:337](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L337)

## Functions

### alt

▸ **alt**<`T`\>(`parsers`): [`Parser`](classes/Parser.md)<[`ResultTypes`](modules.md#resulttypes)<`T`\>[`number`]\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Parser`](classes/Parser.md)<`unknown`\>[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `parsers` | [...T[]] |

#### Returns

[`Parser`](classes/Parser.md)<[`ResultTypes`](modules.md#resulttypes)<`T`\>[`number`]\>

#### Defined in

[index.ts:278](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L278)

___

### cond

▸ **cond**(`predicate`): [`Parser`](classes/Parser.md)<``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `predicate` | (`state`: `any`) => `boolean` |

#### Returns

[`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:324](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L324)

___

### failure

▸ **failure**(`index`): [`Failure`](modules.md#failure)

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |

#### Returns

[`Failure`](modules.md#failure)

#### Defined in

[index.ts:20](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L20)

___

### language

▸ **language**<`T`\>(`syntaxes`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `syntaxes` | { [K in string \| number \| symbol]: Function } |

#### Returns

`T`

#### Defined in

[index.ts:377](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L377)

___

### lazy

▸ **lazy**<`T`\>(`fn`, `name?`): [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | () => [`Parser`](classes/Parser.md)<`T`\> |
| `name?` | `string` |

#### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:296](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L296)

___

### match

▸ **match**<`T`\>(`parser`): [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `parser` | [`Parser`](classes/Parser.md)<`T`\> |

#### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:306](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L306)

___

### notMatch

▸ **notMatch**(`parser`): [`Parser`](classes/Parser.md)<``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `parser` | [`Parser`](classes/Parser.md)<`unknown`\> |

#### Returns

[`Parser`](classes/Parser.md)<``null``\>

#### Defined in

[index.ts:315](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L315)

___

### parser

▸ **parser**<`T`\>(`handler`, `children?`, `name?`): [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `handler` | [`ParserHandler`](modules.md#parserhandler)<`T`\> |
| `children?` | [`Parser`](classes/Parser.md)<`any`\>[] |
| `name?` | `string` |

#### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:291](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L291)

___

### seq

▸ **seq**<`T`\>(`parsers`): [`Parser`](classes/Parser.md)<[`ResultTypes`](modules.md#resulttypes)<[...T]\>\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Parser`](classes/Parser.md)<`any`\>[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `parsers` | [...T[]] |

#### Returns

[`Parser`](classes/Parser.md)<[`ResultTypes`](modules.md#resulttypes)<[...T]\>\>

#### Defined in

[index.ts:251](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L251)

▸ **seq**<`T`, `U`\>(`parsers`, `select`): `T`[`U`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Parser`](classes/Parser.md)<`any`\>[] |
| `U` | extends `number` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `parsers` | [...T[]] |
| `select` | `U` |

#### Returns

`T`[`U`]

#### Defined in

[index.ts:252](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L252)

___

### str

▸ **str**<`T`\>(`value`): [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:221](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L221)

▸ **str**(`pattern`): [`Parser`](classes/Parser.md)<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `pattern` | `RegExp` |

#### Returns

[`Parser`](classes/Parser.md)<`string`\>

#### Defined in

[index.ts:222](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L222)

___

### succeeded

▸ **succeeded**<`T`\>(`value`): [`Parser`](classes/Parser.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `T` |

#### Returns

[`Parser`](classes/Parser.md)<`T`\>

#### Defined in

[index.ts:300](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L300)

___

### success

▸ **success**<`T`\>(`index`, `value`): [`Success`](modules.md#success)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `index` | `number` |
| `value` | `T` |

#### Returns

[`Success`](modules.md#success)<`T`\>

#### Defined in

[index.ts:7](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L7)
