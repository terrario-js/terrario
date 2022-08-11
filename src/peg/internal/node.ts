export type Rule = {
	type: 'rule';
	name: string;
	expr: PegExpr;
};

export type Alt = {
	type: 'alt';
	exprs: PegExpr[];
};

export type Seq = {
	type: 'seq';
	exprs: PegExpr[];
};

export type Text = {
	type: 'text';
	expr: PegExpr;
};

export type Match = {
	type: 'match';
	expr: PegExpr;
};

export type NotMatch = {
	type: 'notMatch';
	expr: PegExpr;
};

export type Option = {
	type: 'option';
	expr: PegExpr;
};

export type Many = {
	type: 'many';
	min: number;
	expr: PegExpr;
};

export type Str = {
	type: 'str';
	value: string;
};

export type Any = {
	type: 'any';
};

export type Ref = {
	type: 'ref';
	name: string;
};

export type PegExpr = Alt | Seq | Text | Match | NotMatch | Option | Many | Str | Any | Ref;
