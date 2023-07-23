# Class: `Parser<T>`

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](Parser.md#constructor)

### Properties

- [ctx](Parser.md#ctx)
- [name](Parser.md#name)

### Methods

- [\_evalContext](Parser.md#_evalcontext)
- [exec](Parser.md#exec)
- [find](Parser.md#find)
- [findAll](Parser.md#findall)
- [many](Parser.md#many)
- [map](Parser.md#map)
- [option](Parser.md#option)
- [parse](Parser.md#parse)
- [state](Parser.md#state)
- [text](Parser.md#text)

## Constructors

### constructor

• **new Parser**<`T`\>(`opts`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`StrictParserOpts`](../modules.md#strictparseropts)<`T`\> |

#### Defined in

[index.ts:33](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L33)

• **new Parser**<`T`\>(`opts`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`LazyParserOpts`](../modules.md#lazyparseropts)<`T`\> |

#### Defined in

[index.ts:34](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L34)

## Properties

### ctx

• **ctx**: [`ParserContext`](../modules.md#parsercontext)<`T`\> \| [`LazyContext`](../modules.md#lazycontext)<`T`\>

#### Defined in

[index.ts:31](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L31)

___

### name

• `Optional` **name**: `string`

#### Defined in

[index.ts:30](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L30)

## Methods

### \_evalContext

▸ **_evalContext**(): [`ParserContext`](../modules.md#parsercontext)<`T`\>

#### Returns

[`ParserContext`](../modules.md#parsercontext)<`T`\>

#### Defined in

[index.ts:50](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L50)

___

### exec

▸ **exec**(`input`, `state?`, `offset?`): [`Result`](../modules.md#result)<`T`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `input` | `string` | `undefined` |
| `state` | `any` | `{}` |
| `offset` | `number` | `0` |

#### Returns

[`Result`](../modules.md#result)<`T`\>

#### Defined in

[index.ts:62](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L62)

___

### find

▸ **find**(`input`, `state?`): `undefined` \| { `index`: `number` ; `input`: `string` ; `result`: [`Result`](../modules.md#result)<`T`\>  }

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |
| `state` | `any` |

#### Returns

`undefined` \| { `index`: `number` ; `input`: `string` ; `result`: [`Result`](../modules.md#result)<`T`\>  }

#### Defined in

[index.ts:72](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L72)

___

### findAll

▸ **findAll**(`input`, `state?`): { `index`: `number` ; `input`: `string` ; `result`: [`Result`](../modules.md#result)<`T`\>  }[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |
| `state` | `any` |

#### Returns

{ `index`: `number` ; `input`: `string` ; `result`: [`Result`](../modules.md#result)<`T`\>  }[]

#### Defined in

[index.ts:83](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L83)

___

### many

▸ **many**(`min?`, `max?`): [`Parser`](Parser.md)<`T`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `min?` | `number` |
| `max?` | `number` |

#### Returns

[`Parser`](Parser.md)<`T`[]\>

#### Defined in

[index.ts:116](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L116)

▸ **many**(`opts`): [`Parser`](Parser.md)<`T`[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.max?` | `number` |
| `opts.min?` | `number` |
| `opts.notMatch?` | [`Parser`](Parser.md)<`unknown`\> |

#### Returns

[`Parser`](Parser.md)<`T`[]\>

#### Defined in

[index.ts:117](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L117)

___

### map

▸ **map**<`U`\>(`fn`): [`Parser`](Parser.md)<`U`\>

#### Type parameters

| Name |
| :------ |
| `U` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | (`value`: `T`) => `U` |

#### Returns

[`Parser`](Parser.md)<`U`\>

#### Defined in

[index.ts:95](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L95)

___

### option

▸ **option**(): [`Parser`](Parser.md)<``null`` \| `T`\>

#### Returns

[`Parser`](Parser.md)<``null`` \| `T`\>

#### Defined in

[index.ts:128](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L128)

___

### parse

▸ **parse**(`input`, `state?`): [`Result`](../modules.md#result)<`T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `input` | `string` |
| `state` | `any` |

#### Returns

[`Result`](../modules.md#result)<`T`\>

#### Defined in

[index.ts:67](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L67)

___

### state

▸ **state**(`key`, `value`): [`Parser`](Parser.md)<`T`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | (`state`: `any`) => `any` |

#### Returns

[`Parser`](Parser.md)<`T`\>

#### Defined in

[index.ts:135](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L135)

___

### text

▸ **text**(): [`Parser`](Parser.md)<`string`\>

#### Returns

[`Parser`](Parser.md)<`string`\>

#### Defined in

[index.ts:105](https://github.com/marihachi/terrario/blob/3f6eafd/src/index.ts#L105)
