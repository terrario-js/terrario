export type Rule = {
  type: 'rule';
  name: string;
  expr: Expr;
};

export type Alt = {
  type: 'alt';
  exprs: Expr[];
};

export type Seq = {
  type: 'seq';
  exprs: Expr[];
};

export type Text = {
  type: 'text';
  expr: Expr;
};

export type Match = {
  type: 'match';
  expr: Expr;
};

export type NotMatch = {
  type: 'notMatch';
  expr: Expr;
};

export type Option = {
  type: 'option';
  expr: Expr;
};

export type Many = {
  type: 'many';
  min: number;
  expr: Expr;
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

export type Expr = Alt | Seq | Text | Match | NotMatch | Option | Many | Str | Any | Ref;
